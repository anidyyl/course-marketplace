import { handler as createAccountHook } from "./useAccount";
import { handler as createNetworkHook } from "./useNetwork";
import { handler as createOwnedCoursesHook } from "./useOwnedCourses";
import { handler as createOwnedCourseHook } from "./useOwnedCourse"
import { handler as createManagedCourses } from "./useManagedCourses"

export const setupHooks = ({web3, provider, contract}) => {
  return {
    useAccount: createAccountHook(web3, provider),
    useNetwork: createNetworkHook(web3, provider),
    useOwnedCourses: createOwnedCoursesHook(web3, contract),
    useOwnedCourse: createOwnedCourseHook(web3, contract),
    useManagedCourses: createManagedCourses(web3, contract)
  }
}