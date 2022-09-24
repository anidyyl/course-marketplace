import useSWR from "swr"
import { createCourseHash } from "utils/hash"
import { normalizeOwnCourse } from "utils/normalize"

export const handler = (web3, contract) => (course, account) => {
  const swrRes = useSWR(() =>
    (web3 && contract && account.data) ? `web3/ownedCourse/${course.id}/${account.data}` : null,
    async () => {

      const courseHash = createCourseHash(web3)(course.id, account.data)
      const ownedCourse = await contract.methods.getCourseByHash(courseHash).call()
      if (ownedCourse.owner === "0x0000000000000000000000000000000000000000") {
        return null
      }
      
      return normalizeOwnCourse(web3)(course, ownedCourse)
    }
  )

  return swrRes
}