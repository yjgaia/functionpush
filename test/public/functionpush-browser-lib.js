global.functionpush = {};

const addFunction = (functionName, functionBody) => {
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
				const callableServerFunctionNames = result.callableServerFunctionNames;
				
				EACH(functionBodies, (functionBody, functionName) => {
					addFunction(functionName, functionBody);
				});
				
				EACH(callableServerFunctionNames, (callableServerFunctionName) => {
					addCallableServerFunctionName(callableServerFunctionName, send);
				});
				
				if (functionpush.ready !== undefined) {
					functionpush.ready();
					functionpush.ready = undefined;
				}
			});
			
			on('newFunction', (functionInfo) => {
				addFunction(functionInfo.name, functionInfo.body);
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
