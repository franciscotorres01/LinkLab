# Evidencia SCRUM-9: roles en el token (RA-01)

Fecha: 2026-11-08 16:13

## analista1
Comando: POST http://localhost:8081/realms/enlace-realm/protocol/openid-connect/token (client_id=enlace-test, grant_type=password)

```json
{"exp":1794172688,"iat":1794172388,"jti":"7a54dbaa-f1a1-4a7e-993f-39559236ed1b","iss":"http://localhost:8081/realms/enlace-realm","aud":"enlace-api","sub":"17960e3a-d3de-4a8c-aa1c-3fb9177725c7","typ":"Bearer","azp":"enlace-test","sid":"e1c0bffd-0ecc-4a46-93a1-4e047224e268","acr":"1","realm_access":{"roles":["analista"]},"scope":"profile email","email_verified":true,"name":"Ana Analista","preferred_username":"analista1","given_name":"Ana","family_name":"Analista","email":"analista1@linklab.com"}
```

## observador1
Comando: POST http://localhost:8081/realms/enlace-realm/protocol/openid-connect/token (client_id=enlace-test, grant_type=password)

```json
{"exp":1794172688,"iat":1794172388,"jti":"cb9907b1-93db-44e9-b3c7-d04d049bcfa6","iss":"http://localhost:8081/realms/enlace-realm","aud":"enlace-api","sub":"f368e6bf-c8b8-415c-9e1e-adae990c7726","typ":"Bearer","azp":"enlace-test","sid":"a3dc842f-708d-442b-b2a2-527cca5e218d","acr":"1","realm_access":{"roles":["observador"]},"scope":"profile email","email_verified":true,"name":"Omar Observador","preferred_username":"observador1","given_name":"Omar","family_name":"Observador","email":"observador1@linklab.com"}
```
