functionpush.ready = () => {
	INTERVAL(1, () => {
		Test.hello('YJ');
		Test.callMe('Hey!');
	});
};
