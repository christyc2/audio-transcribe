# UsersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**readJobsUsersMeJobsGet**](#readjobsusersmejobsget) | **GET** /users/me/jobs/ | Read Jobs|
|[**readUsersMeUsersMeGet**](#readusersmeusersmeget) | **GET** /users/me/ | Read Users Me|
|[**returnJobUsersMeJobsJobIdGet**](#returnjobusersmejobsjobidget) | **GET** /users/me/jobs/{job_id}/ | Return Job|
|[**uploadJobUsersMeJobsPost**](#uploadjobusersmejobspost) | **POST** /users/me/jobs/ | Upload Job|

# **readJobsUsersMeJobsGet**
> Array<Job> readJobsUsersMeJobsGet()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.readJobsUsersMeJobsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Job>**

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **readUsersMeUsersMeGet**
> User readUsersMeUsersMeGet()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.readUsersMeUsersMeGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**User**

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **returnJobUsersMeJobsJobIdGet**
> Job returnJobUsersMeJobsJobIdGet()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let jobId: string; // (default to undefined)

const { status, data } = await apiInstance.returnJobUsersMeJobsJobIdGet(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] |  | defaults to undefined|


### Return type

**Job**

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadJobUsersMeJobsPost**
> Job uploadJobUsersMeJobsPost()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let file: File; // (default to undefined)

const { status, data } = await apiInstance.uploadJobUsersMeJobsPost(
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **file** | [**File**] |  | defaults to undefined|


### Return type

**Job**

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

