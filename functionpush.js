require('uppercase-core');

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
		
		rootPath : 'public'
		
	}, () => {
		
	});
	
	WEB_SOCKET_SERVER(webServer, (clientInfo, on, off, send, disconnect) => {
		
		on('callServerFunction', (callInfo, ret) => {
			console.log(callInfo);
			if (callInfo !== undefined) {
				
				
			}
		});
	});
};
