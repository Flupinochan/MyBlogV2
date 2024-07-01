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
            // ddApiKey: "",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3BhcmFtZXRlcnM0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsY0FBYztJQUEzQjtRQUNFLFdBQU0sR0FBRztZQUNQLFlBQVksRUFBRSx1Q0FBdUM7WUFDckQsUUFBUSxFQUFFLDRDQUE0QztZQUN0RCxZQUFZLEVBQUUsNENBQTRDO1lBQzFELFNBQVMsRUFBRSw2Q0FBNkM7WUFDeEQsZ0JBQWdCO1NBQ2pCLENBQUM7UUFDRixrQkFBYSxHQUFHO1lBQ2QsZ0JBQWdCLEVBQUUsb0NBQW9DO1lBQ3RELFFBQVEsRUFBRSx5Q0FBeUM7WUFDbkQsWUFBWSxFQUFFLHlDQUF5QztTQUN4RCxDQUFDO1FBQ0YsY0FBUyxHQUFHO1lBQ1YsT0FBTyxFQUFFLG9DQUFvQztZQUM3QyxTQUFTLEVBQUUsV0FBVztZQUN0QixRQUFRLEVBQUUseUNBQXlDO1NBQ3BELENBQUM7SUFDSixDQUFDO0NBQUE7QUFsQkQsd0NBa0JDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIE15QmxvZ1BhcmFtNFYyIHtcbiAgbGFtYmRhID0ge1xuICAgIGZ1bmN0aW9uTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtbGFtYmRhXCIsXG4gICAgcm9sZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LWxhbWJkYS1yb2xlXCIsXG4gICAgbG9nR3JvdXBOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1sYW1iZGEtbG9nc1wiLFxuICAgIGxheWVyTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtbGFtYmRhLWxheWVyXCIsXG4gICAgLy8gZGRBcGlLZXk6IFwiXCIsXG4gIH07XG4gIHN0ZXBGdW5jdGlvbnMgPSB7XG4gICAgc3RhdGVNYWNoaW5lTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtc2ZuXCIsXG4gICAgcm9sZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LXNmbi1yb2xlXCIsXG4gICAgbG9nR3JvdXBOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1zZm4tbG9nc1wiLFxuICB9O1xuICB3ZWJzb2NrZXQgPSB7XG4gICAgYXBpTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtYXBpXCIsXG4gICAgc3RhZ2VOYW1lOiBcIndlYnNvY2tldFwiLFxuICAgIHJvbGVOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1hcGktcm9sZVwiLFxuICB9O1xufVxuIl19