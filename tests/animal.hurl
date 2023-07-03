GET http://localhost:3000/api/animal
HTTP 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.data.type" == "animals"
jsonpath "$.data.attributes" exists
jsonpath "$.data.attributes.items" exists
jsonpath "$.data.attributes.items" count == 10
jsonpath "$.data.attributes.items[*].uid" includes "ANMA0000101355"


GET http://localhost:3000/api/animal
[QueryStringParams]
size: 5
HTTP 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.data.type" == "animals"
jsonpath "$.data.attributes" exists
jsonpath "$.data.attributes.items" exists
jsonpath "$.data.attributes.items" count == 5

GET http://localhost:3000/api/animal/ANMA0000101355
HTTP 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.data.type" == "animals"
jsonpath "$.data.attributes" exists
jsonpath "$.data.attributes.uid" == "ANMA0000101355"
jsonpath "$.data.attributes.name" == "Anaconda"

POST http://localhost:3000/api/animal
[FormParams]
name: Anaconda
HTTP 415
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.errors[0].code" == 415
jsonpath "$.errors[0].detail" == "Generic Error"

