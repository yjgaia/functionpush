require('uppercase');

const FS = require('fs');
const Path = require('path');

const browserFunctionBodies = {};
const callableServerFunctionNames = [];
const sends = [];

const loadModules = () => {
	
	// 모듈 이름들을 가져옵니다.
	FIND_FOLDER_NAMES({
		path : 'functions',
		isSync : true
	}, (folderNames) => {
		EACH(folderNames, (folderName) => {
			if (CHECK_IS_ALLOWED_FOLDER_NAME(folderName) === true) {
				loadModuleScripts(folderName);
			}
		});
	});
	
	// 새 모듈이 생겼을 때
	FS.watch('functions', (eventType, folderName) => {
		if (eventType === 'rename') {
			const folderPath = `functions/${folderName}`;
			CHECK_FILE_EXISTS(folderPath, (exists) => {
				if (exists === true) {
					CHECK_IS_FOLDER(folderPath, (isFolder) => {
						if (isFolder === true) {
							loadModuleScripts(folderName);
						}
					});
				}
			});
		}
	});
};

const loadModuleScripts = (moduleName) => {
	
	FIND_FOLDER_NAMES(`functions/${moduleName}`, (folderNames) => {
		EACH(folderNames, (folderName) => {
			
			if (folderName === 'browser') {
				scanFunctionFolder(moduleName, folderName, `functions/${moduleName}/${folderName}`, (functionName, functionBody) => {
					browserFunctionBodies[functionName] = functionBody;
				}, (functionName, functionBody) => {
					broadcastNewFunction({
						name : functionName,
						body : functionBody
					});
				});
			}
			
			else if (folderName === 'common') {
				scanFunctionFolder(moduleName, folderName, `functions/${moduleName}/${folderName}`, (functionName, functionBody) => {
					installFunction(functionName, functionBody);
					browserFunctionBodies[functionName] = functionBody;
				}, (functionName, functionBody) => {
					broadcastNewFunction({
						name : functionName,
						body : functionBody
					});
				});
			}
			
			else if (folderName === 'server') {
				scanFunctionFolder(moduleName, folderName, `functions/${moduleName}/${folderName}`, (functionName, functionBody) => {
					installFunction(functionName, functionBody);
				}, () => {});
			}
			
			else if (folderName === 'server-call') {
				scanFunctionFolder(moduleName, folderName, `functions/${moduleName}/${folderName}`, (functionName, functionBody) => {
					installFunction(functionName, functionBody);
					if (CHECK_IS_IN({
						array : callableServerFunctionNames,
						value : functionName
					}) !== true) {
						callableServerFunctionNames.push(functionName);
					}
				}, (functionName) => {
					broadcastNewCallableServerFunction(functionName);
				});
			}
		});
	});
};

let scanFunctionFolder = (moduleName, environmentName, path, load, broadcast) => {
	
	let folderNames = [];
	
	FIND_FILE_NAMES(path, (fileNames) => {
		EACH(fileNames, (fileName) => {
			const extname = Path.extname(fileName).toLowerCase();
			if (extname === '.js' || extname === '.json') {
				const filePath = `${path}/${fileName}`;
				READ_FILE(filePath, (functionBody) => {
					load(moduleName + filePath.substring(`functions/${moduleName}/${environmentName}`.length, filePath.length - extname.length).replace(/\//g, '.'), functionBody.toString());
				});
			}
		});
	});
	
	// 새 함수가 생기거나, 함수가 수정될 때
	FS.watch(path, (eventType, fileName) => {
		if (eventType === 'rename' || eventType === 'change') {
			const filePath = `${path}/${fileName}`;
			CHECK_FILE_EXISTS(filePath, (exists) => {
				if (exists === true) {
					CHECK_IS_FOLDER(filePath, (isFolder) => {
						if (isFolder !== true) {
							const extname = Path.extname(fileName).toLowerCase();
							if (extname === '.js' || extname === '.json') {
								READ_FILE(filePath, (_functionBody) => {
									const functionName = moduleName + filePath.substring(`functions/${moduleName}/${environmentName}`.length, filePath.length - extname.length).replace(/\//g, '.');
									const functionBody = _functionBody.toString();
									load(functionName, functionBody);
									broadcast(functionName, functionBody);
								});
							}
						}
					});
				}
			});
		}
	});

	FIND_FOLDER_NAMES(path, (folderNames) => {
		EACH(folderNames, (folderName) => {
			if (CHECK_IS_ALLOWED_FOLDER_NAME(folderName) === true) {
				scanFunctionFolder(moduleName, `${path}/{folderName}`, load, broadcast);
			}
		});
	});
};

const installFunction = (functionName, functionBody) => {
	const nameParts = functionName.split('.');
	
	let parent = global;
	EACH(nameParts, (namePart, i) => {
		if (i === nameParts.length - 1) {
			try {
				parent[namePart] = eval('(' + functionBody + ')');
			} catch(error) {
				SHOW_ERROR('functionpush', error.toString());
			}
		} else if (parent[namePart] === undefined) {
			parent[namePart] = {};
		}
		parent = parent[namePart];
	});
};

const runFunction = (functionName, params, callback) => {
	const nameParts = functionName.split('.');
	
	let func = global;
	EACH(nameParts, (namePart, i) => {
		func = func[namePart];
		if (func === undefined) {
			return false;
		} else if (i === nameParts.length - 1) {
			func(params, callback);
		}
	});
};

const broadcastNewFunction = (functionInfo) => {
	EACH(sends, (send) => {
		send({
			methodName : 'newFunction',
			data : functionInfo
		});
	});
};

const broadcastNewCallableServerFunction = (functionName) => {
	EACH(sends, (send) => {
		send({
			methodName : 'newCallableServerFunction',
			data : functionName
		});
	});
};

module.exports = (config) => {
	//REQUIRED: port
	//OPTIONAL: securedPort
	//OPTIONAL: securedKeyFilePath
	//OPTIONAL: securedCertFilePath
	
	const webServer = WEB_SERVER({

		port : config.port,

		securedPort : config.securedPort,
		securedKeyFilePath : config.securedKeyFilePath,
		securedCertFilePath : config.securedCertFilePath,
		
		rootPath : 'public',
		
		isToNotUseResourceCache : true
	});
	
	WEB_SOCKET_SERVER(webServer, (clientInfo, on, off, send, disconnect) => {
		
		on('getFunctions', (notUsing, ret) => {
			ret({
				functionBodies : browserFunctionBodies,
				callableServerFunctionNames : callableServerFunctionNames
			});
		});
		
		on('callServerFunction', (callInfo, ret) => {
			if (callInfo !== undefined && callInfo.functionName !== undefined) {
				runFunction(callInfo.functionName, callInfo.params, ret);
			}
		});
		
		sends.push(send);
		on('__DISCONNECTED', () => {
			REMOVE({
				array : sends,
				value : send
			});
		});
	});
	
	loadModules();
};
