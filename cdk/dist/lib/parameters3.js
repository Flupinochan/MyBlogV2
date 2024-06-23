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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3BhcmFtZXRlcnMzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsY0FBYztJQUEzQjtRQUNFLFlBQU8sR0FBRztZQUNSLFlBQVksRUFBRSx1Q0FBdUM7WUFDckQsa0JBQWtCLEVBQUUseUNBQXlDO1lBQzdELGdCQUFnQixFQUFFLDJDQUEyQztZQUM3RCxRQUFRLEVBQUUsbUNBQW1DO1lBQzdDLGNBQWMsRUFBRSxFQUFFO1NBQ25CLENBQUM7UUFDRixRQUFHLEdBQUc7WUFDSixVQUFVLEVBQUUsaUNBQWlDO1NBQzlDLENBQUM7SUFDSixDQUFDO0NBQUE7QUFYRCx3Q0FXQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBNeUJsb2dQYXJhbTNWMiB7XG4gIGNvZ25pdG8gPSB7XG4gICAgdXNlclBvb2xOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZ25pdG8tdXNlcnBvb2xcIixcbiAgICB1c2VyUG9vbENsaWVudE5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItY29nbml0by1jbGllbnRwb29sXCIsXG4gICAgaWRlbnRpdHlQb29sTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1jb2duaXRvLWlkZW50aXR5cG9vbFwiLFxuICAgIHJvbGVOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZ25pdG8tcm9sZVwiLFxuICAgIGNlcnRpZmljYXRlQXJuOiBcIlwiLFxuICB9O1xuICBpb3QgPSB7XG4gICAgcG9saWN5TmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1pb3QtcG9saWN5XCIsXG4gIH07XG59XG4iXX0=