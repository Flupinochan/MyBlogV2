"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBlogParam3V2 = void 0;
class MyBlogParam3V2 {
    constructor() {
        this.cognito = {
            userPoolName: "metalmental-myblogv2-cognito-userpool",
            userPoolClientName: "metalmental-myblogv2-cognito-clientpool",
            identityPoolName: "metalmental-myblogv2-cognito-identitypool",
            roleName: "metalmental-myblogv2-cognito-role",
            certificateArn: "",
            userIdentityId: "us-west-2:39a49333-107c-c3c1-a791-0bbaf24c30c5",
        };
        this.iot = {
            policyName: "metalmental-myblogv2-iot-policy",
        };
    }
}
exports.MyBlogParam3V2 = MyBlogParam3V2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3BhcmFtZXRlcnMzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsY0FBYztJQUEzQjtRQUNFLFlBQU8sR0FBRztZQUNSLFlBQVksRUFBRSx1Q0FBdUM7WUFDckQsa0JBQWtCLEVBQUUseUNBQXlDO1lBQzdELGdCQUFnQixFQUFFLDJDQUEyQztZQUM3RCxRQUFRLEVBQUUsbUNBQW1DO1lBQzdDLGNBQWMsRUFBRSxxRkFBcUY7WUFDckcsY0FBYyxFQUFFLGdEQUFnRDtTQUNqRSxDQUFDO1FBQ0YsUUFBRyxHQUFHO1lBQ0osVUFBVSxFQUFFLGlDQUFpQztTQUM5QyxDQUFDO0lBQ0osQ0FBQztDQUFBO0FBWkQsd0NBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTXlCbG9nUGFyYW0zVjIge1xuICBjb2duaXRvID0ge1xuICAgIHVzZXJQb29sTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1jb2duaXRvLXVzZXJwb29sXCIsXG4gICAgdXNlclBvb2xDbGllbnROYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZ25pdG8tY2xpZW50cG9vbFwiLFxuICAgIGlkZW50aXR5UG9vbE5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItY29nbml0by1pZGVudGl0eXBvb2xcIixcbiAgICByb2xlTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1jb2duaXRvLXJvbGVcIixcbiAgICBjZXJ0aWZpY2F0ZUFybjogXCJhcm46YXdzOmFjbTp1cy1lYXN0LTE6MjQ3NTc0MjQ2MTYwOmNlcnRpZmljYXRlLzQyMDcwMmE0LTQzODgtNGE0Ny05ZDJhLWM1NWQ1MGJiZjdhN1wiLFxuICAgIHVzZXJJZGVudGl0eUlkOiBcInVzLXdlc3QtMjozOWE0OTMzMy0xMDdjLWMzYzEtYTc5MS0wYmJhZjI0YzMwYzVcIixcbiAgfTtcbiAgaW90ID0ge1xuICAgIHBvbGljeU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItaW90LXBvbGljeVwiLFxuICB9O1xufVxuIl19