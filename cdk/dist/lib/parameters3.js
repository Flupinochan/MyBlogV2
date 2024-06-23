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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3BhcmFtZXRlcnMzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsY0FBYztJQUEzQjtRQUNFLFlBQU8sR0FBRztZQUNSLFlBQVksRUFBRSx1Q0FBdUM7WUFDckQsa0JBQWtCLEVBQUUseUNBQXlDO1lBQzdELGdCQUFnQixFQUFFLDJDQUEyQztZQUM3RCxRQUFRLEVBQUUsbUNBQW1DO1lBQzdDLGNBQWMsRUFBRSxxRkFBcUY7U0FDdEcsQ0FBQztRQUNGLFFBQUcsR0FBRztZQUNKLFVBQVUsRUFBRSxpQ0FBaUM7U0FDOUMsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQVhELHdDQVdDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIE15QmxvZ1BhcmFtM1YyIHtcbiAgY29nbml0byA9IHtcbiAgICB1c2VyUG9vbE5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItY29nbml0by11c2VycG9vbFwiLFxuICAgIHVzZXJQb29sQ2xpZW50TmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1jb2duaXRvLWNsaWVudHBvb2xcIixcbiAgICBpZGVudGl0eVBvb2xOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZ25pdG8taWRlbnRpdHlwb29sXCIsXG4gICAgcm9sZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItY29nbml0by1yb2xlXCIsXG4gICAgY2VydGlmaWNhdGVBcm46IFwiYXJuOmF3czphY206dXMtZWFzdC0xOjI0NzU3NDI0NjE2MDpjZXJ0aWZpY2F0ZS80MjA3MDJhNC00Mzg4LTRhNDctOWQyYS1jNTVkNTBiYmY3YTdcIixcbiAgfTtcbiAgaW90ID0ge1xuICAgIHBvbGljeU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItaW90LXBvbGljeVwiLFxuICB9O1xufVxuIl19