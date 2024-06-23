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
        };
        this.iot = {
            policyName: "metalmental-myblogv2-iot-policy",
        };
    }
}
exports.MyBlogParam3V2 = MyBlogParam3V2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczMgY29weS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcGFyYW1ldGVyczMgY29weS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFhLGNBQWM7SUFBM0I7UUFDRSxZQUFPLEdBQUc7WUFDUixZQUFZLEVBQUUsdUNBQXVDO1lBQ3JELGtCQUFrQixFQUFFLHlDQUF5QztZQUM3RCxnQkFBZ0IsRUFBRSwyQ0FBMkM7WUFDN0QsUUFBUSxFQUFFLG1DQUFtQztZQUM3QyxjQUFjLEVBQUUsRUFBRTtTQUNuQixDQUFDO1FBQ0YsUUFBRyxHQUFHO1lBQ0osVUFBVSxFQUFFLGlDQUFpQztTQUM5QyxDQUFDO0lBQ0osQ0FBQztDQUFBO0FBWEQsd0NBV0MiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTXlCbG9nUGFyYW0zVjIge1xuICBjb2duaXRvID0ge1xuICAgIHVzZXJQb29sTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1jb2duaXRvLXVzZXJwb29sXCIsXG4gICAgdXNlclBvb2xDbGllbnROYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZ25pdG8tY2xpZW50cG9vbFwiLFxuICAgIGlkZW50aXR5UG9vbE5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItY29nbml0by1pZGVudGl0eXBvb2xcIixcbiAgICByb2xlTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1jb2duaXRvLXJvbGVcIixcbiAgICBjZXJ0aWZpY2F0ZUFybjogXCJcIixcbiAgfTtcbiAgaW90ID0ge1xuICAgIHBvbGljeU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItaW90LXBvbGljeVwiLFxuICB9O1xufVxuIl19