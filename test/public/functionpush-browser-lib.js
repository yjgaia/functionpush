global.functionpush = {};

const reconnect = RAR(() => {
	
	CONNECT_TO_WEB_SOCKET_SERVER((on, off, send, disconnect) => {
		
		send('getFunctions', (result) => {
			
			const functionBodies = result.functionBodies;
			const callableServerFunctionNames = result.callableServerFunctionNames;
			
			EACH(functionBodies, (functionBody, functionName) => {
				const nameParts = functionName.split('.');
				
				let parent = global;
				EACH(nameParts, (namePart, i) => {
					if (i === nameParts.length - 1) {
						parent[namePart] = eval(functionBody);
					} else if (parent[namePart] === undefined) {
						parent[namePart] = {};
					}
					parent = parent[namePart];
				});
			});
			
			EACH(callableServerFunctionNames, (callableServerFunctionName) => {
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
			});
			
			if (functionpush.ready !== undefined) {
				functionpush.ready();
				functionpush.ready = undefined;
			}
		});
		
		on('__DISCONNECTED', () => {
			reconnect();
		});
	});
});
