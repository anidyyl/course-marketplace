import useSWR from "swr"
import { normalizeOwnCourse } from "utils/normalize"
import { createCourseHash } from "utils/hash"

export const handler = (web3, contract) => (courses, account, network) => {
  const swrRes = useSWR(() =>
    (web3 && contract && account.data && network.data) ? `web3/ownedCourses/${account.data}/${network.data}` : null,
    async () => {
      const ownedCourses = []
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i]
        if (!course.id) { continue }

        const courseHash = createCourseHash(web3)(course.id, account.data)
        const ownedCourse = await contract.methods.getCourseByHash(courseHash).call()
        if (ownedCourse.owner !== "0x0000000000000000000000000000000000000000") {
          const normalized = normalizeOwnCourse(web3)(course, ownedCourse)
          ownedCourses.push(normalized)
        }
      }
      
      return ownedCourses
    }
  )

  return {
    ...swrRes,
    lookup: swrRes.data?.reduce( (a,c) => {
      a[c.id] = c
      return a
    }, {}) ?? {}
  }
}