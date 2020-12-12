
## 옵션

### 이메일 관련 설정
함수 실행 중 오류가 발생할 때 이메일을 보낼 수 있도록 설정할 수 있습니다.
* `mailHost`
* `mailPort`
* `mailIsSecure`
* `mailUsername`
* `mailPassword`

### 뷰 관련 설정
* `defaultModuleName` 기본 모듈 이름을 지정합니다. 그러면 주소에서 기본 모듈 이름을 생략할 수 있습니다.

예) 기본 모듈 이름이 Hanul이라면, 아래와 같이 주소에서 모듈명을 생략할 수 있습니다.
```
http://localhost/Hanul/helloworld
http://localhost/helloworld
```

## 프로젝트 구조
* `functions` 폴더 - 함수들을 저장하는 폴더입니다.
	* `functions` 폴더 내 폴더들 - 모듈입니다. 폴더 이름이 모듈명이 됩니다.
		* 모듈 내 `browser` 폴더 - 브라우저 환경에서 실행 가능한 함수들을 저장합니다.
		* 모듈 내 `common` 폴더 - 브라우저 환경과 Node.js 환경 양쪽에서 실행 가능한 함수들을 저장합니다.
		* 모듈 내 `server` 폴더 - Node.js 환경에서 실행 가능한 함수들을 저장합니다.
		* 모듈 내 `server-api` 폴더 - Node.js 환경에서 실행가능하며, 브라우저 환경에서도 호출할 수 있습니다. 브라우저에서 호출하더라도 서버에서 구동되며 결과를 반환합니다.
* `public` 폴더 - 웹 서버에서 제공하는 리소스들을 저장하는 폴더입니다.
* 실행 파일 - [실행](#실행) 코드가 저장된 실행 파일입니다.

## 특수 기능
### `functionpush.addReadyListener`
애플리케이션의 실행 준비가 완료되면 실행되는 리스너를 등록합니다.

### `functionpush.stateStore`
애플리케이션이 종료되면 데이터가 유실됩니다.

### `functionpush.storageStore`
애플리케이션이 종료되어도 데이터가 유실되지 않습니다.

## 알아야 할 사항
- 함수 실행 중 오류가 발생하면 성공한 버전의 함수를 재실행합니다.
