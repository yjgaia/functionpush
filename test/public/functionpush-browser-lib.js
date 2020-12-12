let defaultModuleName;

global.functionpush = {};
global.viewFunctionUris = {};

const addFunction = (functionName, functionBody) => {
	
	functionBody = functionBody.trim();
	functionBody = functionBody[functionBody.length - 1] === ';' ? functionBody.substring(0, functionBody.length - 1) : functionBody;
	functionBody = functionBody === '' ? 'undefined' : functionBody;
	
	const nameParts = functionName.split('.');
	
	let parent = global;
	EACH(nameParts, (namePart, i) => {
		if (i === nameParts.length - 1) {
			parent[namePart] = eval('(' + functionBody + ')');
		} else if (parent[namePart] === undefined) {
			parent[namePart] = {};
		}
		parent = parent[namePart];
	});
};

const addViewFunction = (viewFunctionName, functionBody) => {
	viewFunctionUris[viewFunctionName.replace(/\./g, '/')] = viewFunctionName;
	
	// 기본 모듈명이면 생략 가능합니다.
	if (viewFunctionName.substring(0, viewFunctionName.indexOf('.')) === defaultModuleName) {
		viewFunctionUris[viewFunctionName.substring(viewFunctionName.indexOf('.') + 1).replace(/\./g, '/')] = viewFunctionName;
	}
	
	addFunction(viewFunctionName, functionBody);
};

const runViewFunction = (uri, params, callback) => {
	
	const functionName = viewFunctionUris[uri];
	
	if (functionName !== undefined) {
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
	}
};

const addCallableServerFunctionName = (callableServerFunctionName, send) => {
	const nameParts = callableServerFunctionName.split('.');
	
	let parent = global;
	EACH(nameParts, (namePart, i) => {
		if (i === nameParts.length - 1) {
			parent[namePart] = (params, callback) => {
				send({
					methodName : 'callServerFunction',
					data : {
						functionName : callableServerFunctionName,
						params : params
					}
				}, callback);
			};
		} else if (parent[namePart] === undefined) {
			parent[namePart] = {};
		}
		parent = parent[namePart];
	});
};

const reconnect = RAR(() => {
	
	CONNECT_TO_WEB_SOCKET_SERVER({
		
		error : () => {
			reconnect();
		},
		
		success : (on, off, send, disconnect) => {
			
			send('getFunctions', (result) => {
				
				const functionBodies = result.functionBodies;
				const viewFunctionBodies = result.viewFunctionBodies;
				const callableServerFunctionNames = result.callableServerFunctionNames;
				
				defaultModuleName = result.defaultModuleName;
				
				EACH(functionBodies, (functionBody, functionName) => {
					addFunction(functionName, functionBody);
				});
				
				EACH(viewFunctionBodies, (functionBody, functionName) => {
					addViewFunction(functionName, functionBody);
				});
				
				EACH(callableServerFunctionNames, (callableServerFunctionName) => {
					addCallableServerFunctionName(callableServerFunctionName, send);
				});
				
				if (functionpush.ready !== undefined) {
					functionpush.ready();
					functionpush.ready = undefined;
				}
				
				EVENT('popstate', RAR(() => {
					
					const url = new URL(location.href);
					
					const params = {};
					for (const [key, value] of url.searchParams) {
						params[key] = value;
					}
					
					runViewFunction(url.pathname.substring(1), params, () => {
						// ignore.
					});
				}));
			});
			
			on('newFunction', (functionInfo) => {
				addFunction(functionInfo.name, functionInfo.body);
			});
			
			on('newViewFunction', (functionInfo) => {
				addViewFunctionName(functionInfo.name, functionInfo.body);
			});
			
			on('newCallableServerFunction', (callableServerFunctionName) => {
				addCallableServerFunctionName(callableServerFunctionName, send);
			});
			
			on('__DISCONNECTED', () => {
				reconnect();
			});
		}
	});
});
