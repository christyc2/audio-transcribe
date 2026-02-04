# AuthenticationApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**loginForAccessTokenAuthLoginPost**](#loginforaccesstokenauthloginpost) | **POST** /auth/login | Login For Access Token|
|[**registerAuthRegisterPost**](#registerauthregisterpost) | **POST** /auth/register | Register|

# **loginForAccessTokenAuthLoginPost**
> Token loginForAccessTokenAuthLoginPost()


### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let username: string; // (default to undefined)
let password: string; // (default to undefined)
let grantType: string; // (optional) (default to undefined)
let scope: string; // (optional) (default to '')
let clientId: string; // (optional) (default to undefined)
let clientSecret: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.loginForAccessTokenAuthLoginPost(
    username,
    password,
    grantType,
    scope,
    clientId,
    clientSecret
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **username** | [**string**] |  | defaults to undefined|
| **password** | [**string**] |  | defaults to undefined|
| **grantType** | [**string**] |  | (optional) defaults to undefined|
| **scope** | [**string**] |  | (optional) defaults to ''|
| **clientId** | [**string**] |  | (optional) defaults to undefined|
| **clientSecret** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Token**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/x-www-form-urlencoded
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registerAuthRegisterPost**
> User registerAuthRegisterPost(user)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    User
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let user: User; //

const { status, data } = await apiInstance.registerAuthRegisterPost(
    user
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **user** | **User**|  | |


### Return type

**User**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

