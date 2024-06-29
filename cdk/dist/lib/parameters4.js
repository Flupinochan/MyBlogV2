"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBlogParam4V2 = void 0;
class MyBlogParam4V2 {
    constructor() {
        this.lambda = {
            functionName: "metalmental-myblogv2-websocket-lambda",
            roleName: "metalmental-myblogv2-websocket-lambda-role",
            logGroupName: "metalmental-myblogv2-websocket-lambda-logs",
            layerName: "metalmental-myblogv2-websocket-lambda-layer",
            ddApiKey: "",
        };
        this.stepFunctions = {
            stateMachineName: "metalmental-myblogv2-websocket-sfn",
            roleName: "metalmental-myblogv2-websocket-sfn-role",
            logGroupName: "metalmental-myblogv2-websocket-sfn-logs",
        };
        this.websocket = {
            apiName: "metalmental-myblogv2-websocket-api",
            stageName: "websocket",
            roleName: "metalmental-myblogv2-websocket-api-role",
        };
    }
}
exports.MyBlogParam4V2 = MyBlogParam4V2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3BhcmFtZXRlcnM0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsY0FBYztJQUEzQjtRQUNFLFdBQU0sR0FBRztZQUNQLFlBQVksRUFBRSx1Q0FBdUM7WUFDckQsUUFBUSxFQUFFLDRDQUE0QztZQUN0RCxZQUFZLEVBQUUsNENBQTRDO1lBQzFELFNBQVMsRUFBRSw2Q0FBNkM7WUFDeEQsUUFBUSxFQUFFLGtDQUFrQztTQUM3QyxDQUFDO1FBQ0Ysa0JBQWEsR0FBRztZQUNkLGdCQUFnQixFQUFFLG9DQUFvQztZQUN0RCxRQUFRLEVBQUUseUNBQXlDO1lBQ25ELFlBQVksRUFBRSx5Q0FBeUM7U0FDeEQsQ0FBQztRQUNGLGNBQVMsR0FBRztZQUNWLE9BQU8sRUFBRSxvQ0FBb0M7WUFDN0MsU0FBUyxFQUFFLFdBQVc7WUFDdEIsUUFBUSxFQUFFLHlDQUF5QztTQUNwRCxDQUFDO0lBQ0osQ0FBQztDQUFBO0FBbEJELHdDQWtCQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBNeUJsb2dQYXJhbTRWMiB7XG4gIGxhbWJkYSA9IHtcbiAgICBmdW5jdGlvbk5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LWxhbWJkYVwiLFxuICAgIHJvbGVOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1sYW1iZGEtcm9sZVwiLFxuICAgIGxvZ0dyb3VwTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtbGFtYmRhLWxvZ3NcIixcbiAgICBsYXllck5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LWxhbWJkYS1sYXllclwiLFxuICAgIGRkQXBpS2V5OiBcIjRkYTk5N2I4NWM5YjUzNmFmMjRhMGVhNzBjMzg0NGRlXCIsXG4gIH07XG4gIHN0ZXBGdW5jdGlvbnMgPSB7XG4gICAgc3RhdGVNYWNoaW5lTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtc2ZuXCIsXG4gICAgcm9sZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LXNmbi1yb2xlXCIsXG4gICAgbG9nR3JvdXBOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1zZm4tbG9nc1wiLFxuICB9O1xuICB3ZWJzb2NrZXQgPSB7XG4gICAgYXBpTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtYXBpXCIsXG4gICAgc3RhZ2VOYW1lOiBcIndlYnNvY2tldFwiLFxuICAgIHJvbGVOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1hcGktcm9sZVwiLFxuICB9O1xufVxuIl19