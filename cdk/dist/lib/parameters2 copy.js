"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBlogParam2V2 = void 0;
class MyBlogParam2V2 {
    constructor() {
        this.lambda = {
            functionName: "metalmental-myblogv2-lambda-chat",
            logGroupName: "metalmental-myblogv2-lambda-logs-chat",
            roleName: "metalmental-myblogv2-lambda-role-chat",
            layerName: "metalmental-myblogv2-lambda-layer-chat",
        };
        this.apiGateway = {
            logGroupName: "metalmental-myblogv2-apigw-logs",
            apiName: "metalmental-myblogv2-apigw",
        };
    }
}
exports.MyBlogParam2V2 = MyBlogParam2V2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczIgY29weS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcGFyYW1ldGVyczIgY29weS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFhLGNBQWM7SUFBM0I7UUFDRSxXQUFNLEdBQUc7WUFDUCxZQUFZLEVBQUUsa0NBQWtDO1lBQ2hELFlBQVksRUFBRSx1Q0FBdUM7WUFDckQsUUFBUSxFQUFFLHVDQUF1QztZQUNqRCxTQUFTLEVBQUUsd0NBQXdDO1NBQ3BELENBQUM7UUFDRixlQUFVLEdBQUc7WUFDWCxZQUFZLEVBQUUsaUNBQWlDO1lBQy9DLE9BQU8sRUFBRSw0QkFBNEI7U0FDdEMsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQVhELHdDQVdDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIE15QmxvZ1BhcmFtMlYyIHtcbiAgbGFtYmRhID0ge1xuICAgIGZ1bmN0aW9uTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1sYW1iZGEtY2hhdFwiLFxuICAgIGxvZ0dyb3VwTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1sYW1iZGEtbG9ncy1jaGF0XCIsXG4gICAgcm9sZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItbGFtYmRhLXJvbGUtY2hhdFwiLFxuICAgIGxheWVyTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1sYW1iZGEtbGF5ZXItY2hhdFwiLFxuICB9O1xuICBhcGlHYXRld2F5ID0ge1xuICAgIGxvZ0dyb3VwTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1hcGlndy1sb2dzXCIsXG4gICAgYXBpTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1hcGlnd1wiLFxuICB9O1xufVxuIl19