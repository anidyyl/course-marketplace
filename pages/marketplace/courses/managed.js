import { useAccount, useAdmin, useManagedCourses } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Message } from "@components/ui/common";
import { CourseFilter, ManagedCourseCard, OwnedCourseCard } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { MarketplaceHeader } from "@components/ui/marketplace";
import { withToast } from "@utils/toast";
import { useEffect, useState } from "react";

const VerificationInput = ({onVerify}) => {
  const [ email, setEmail ] = useState("")
  return (
    <div className="flex mr-2 relative rounded-md">
      <input
        value={email}
        onChange={({target: {value: value}}) => setEmail(value)}
        type="text"
        name="account"
        id="account"
        className="w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
        placeholder="0x2341ab..." />
      <Button
        onClick={() => onVerify(email)}
      >
        Verify
      </Button>
    </div>
  )
}

export default function ManagedCourses() {
  const [ proofOwnership, setProofOwnership] = useState({})
  const { web3, contract } = useWeb3()
  const { account } = useAdmin({redirectTo: "/marketplace"})
  const { managedCourses } = useManagedCourses(account)
  const [displayCourses, setDisplayCourses] = useState(null)
  
  const verifyCourse = (email, {hash, proof}) => {
    if (!email) return
    const emailHash = web3.utils.sha3(email)
    const proofToCheck = web3.utils?.soliditySha3(
      { type: "bytes32", value: emailHash },
      { type: "bytes32", value: hash }
    )

    proofToCheck === proof ?
      setProofOwnership({
        ...proofOwnership,
        [hash]: true
      }) :
      setProofOwnership({
        ...proofOwnership,
        [hash]: false
      })
  }

  const changeCourseState = async (courseHash, method) => {
    try {
      const result = await contract.methods
        [method](courseHash)
        .send({
          from:account.data
        })
      return result
    } catch (e) {
      throw new Error(e.message)
    }
  }

  const onFilterChange = (searchText, state) => {
    if (!searchText && state === "all") return setDisplayCourses(managedCourses)
    const filteredCourses = managedCourses.data.filter((c) => c.hash.includes(searchText) && (c.state === state || state === "all"))
    setDisplayCourses({...managedCourses, data: filteredCourses})
    
  }

  if (!account.isAdmin) {
    return null
  }
  return(
    <>
      <MarketplaceHeader />
      <CourseFilter onFilterChange={onFilterChange}/>
      <section className="grid grid-cols-1">
        { (displayCourses ??  managedCourses).data?.map(course =>
          <ManagedCourseCard 
            key={course.ownedCourseId}
            course={course}
          >
            <VerificationInput
              onVerify={(email) => {
                verifyCourse(email, { hash: course.hash, proof: course.proof})
              }}
            />
            { proofOwnership[course.hash] &&
              <div>
                <Message>
                  Verified
                </Message>
              </div>
            }
            { proofOwnership[course.hash] === false &&
              <div>
                <Message type="danger">
                  Wrong proof
                </Message>
              </div>
            }
            { course.state === "purchased" &&
              <div className="mt-2">
                <Button
                  onClick={() => withToast(changeCourseState(course.hash, "activateCourse"))}
                  variant="green">
                  Activate
                </Button>
                <Button
                  onClick={() => withToast(changeCourseState(course.hash, "deactivateCourse"))}
                  variant="red">
                  Deactivate
                </Button>
              </div>
            }
            
          </ManagedCourseCard>
        )}
      </section>
    </>
  )
}

ManagedCourses.Layout = BaseLayout