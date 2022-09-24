import { useOwnedCourses, useWalletInfo } from "@components/hooks/web3"
import { useWeb3 } from "@components/providers"
import { Button, Loader, Message } from "@components/ui/common"
import { CourseCard, CourseList } from "@components/ui/course"
import { BaseLayout } from "@components/ui/layout"
import { MarketplaceHeader } from "@components/ui/marketplace"
import { OrderModal } from "@components/ui/order"
import { getAllCourses } from "@content/courses/fetcher"
import { withToast } from "@utils/toast"
import { useState } from "react"


export default function Marketplace({courses}) {

  const { web3, contract, requireInstall } = useWeb3()
  const { hasConnectedWallet, isConnecting, account, network } = useWalletInfo()
  const { ownedCourses } = useOwnedCourses(courses, account, network)
  
  const [selectedCourse, setSelectedCourse] = useState(null) 
  const [busyCourseId, setBusyCourseId] = useState(null)
  const [isNewPurchase, setIsNewPurchase] = useState(true)

  const purchaseCourse = (order, course) => {
    const hexCourseId = web3.utils.utf8ToHex(course.id)
    console.log(hexCourseId)

    const orderHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexCourseId },
      { type: "address", value: account.data }
    )

    const value = web3.utils.toWei(order.price)
    
    setBusyCourseId(course.id)

    if (isNewPurchase) {
      const emailHash = web3.utils.sha3(order.email)
      const proof = web3.utils.soliditySha3(
        { type: "bytes32", value: emailHash },
        { type: "bytes32", value: orderHash },
      )
      console.log(proof)
      withToast(_purchaseCourse({hexCourseId, proof, account, value}, course))
    } else {
      withToast(_repurchaseCourse({hexCourseId: orderHash, account, value}, course))
    }
  }

  const _purchaseCourse = async ({hexCourseId, proof, account, value}, course) => {
    try {
      const result = await contract.methods.purchaseCourse(
        hexCourseId, 
        proof
      ).send({from: account.data, value})
      ownedCourses.mutate([
        ...ownedCourses.data,
        {
          ...course,
          proof,
          state: "purchased",
          owner: account.data,
          price: value
        }
      ])
      return result
    } catch (e) {
      throw new Error(e.message)
    } finally {
      setBusyCourseId(null)
      cleanupModal()
    }
  }

  const _repurchaseCourse = async ({hexCourseId, account, value}, course) => {
    try {
      const result = await contract.methods.repurchaseCourse(
        hexCourseId, 
      ).send({from: account.data, value})

      const index = ownedCourses.data.findIndex( c => c.id === course.id)
      if (index >= 0) {
        ownedCourses.data[index].state = "purchased"
        ownedCourses.mutate(ownedCourses.data)
      } else {
        ownedCourses.mutate()
      }
      
      return result
    } catch(e) {
      throw new Error(e.message)
    } finally {
      setBusyCourseId(null)
      cleanupModal()
    }
  }

  const cleanupModal = () => {
    setSelectedCourse(null)
    setIsNewPurchase(true)
  }

  const notify = () => {
    const resolveWithSomeData = new Promise(resolve => setTimeout(() => resolve({
      transactionHash: "0xfd63cd0ce0d4a47713cd96f7bcdab71ecbdd72b966844e2c4e36702ff21f78c5"
    }), 3000));
    // const resolveWithSomeData = new Promise((resolve, reject) => setTimeout(() => reject(new Error("some error")), 3000));
    withToast(resolveWithSomeData)
  }

  return (
    <>
      <MarketplaceHeader />
      <CourseList courses={courses}>
        {
          course => {
            const owned = ownedCourses.lookup[course.id]
            return (
              <CourseCard 
                course={course} 
                key={course.id} 
                disabled={!hasConnectedWallet}
                state={owned?.state}
                Footer={() => {

                  if (requireInstall) {
                    return (
                      <Button 
                        size="sm"
                        variant="lightPurple"
                        disabled={true}>
                        Install
                      </Button>
                    )
                  }

                  if (isConnecting) {
                    return (
                      <Button 
                        size="sm"
                        variant="lightPurple"
                        disabled={true}>
                        <Loader size="sm" />
                      </Button>
                    )
                  }

                  if (!ownedCourses.hasInitialResponse) {
                    return (
                      // <div style={{height: "42px"}}></div>
                      <button
                        variant="white"
                        disabled={true}
                        size="sm">
                        { hasConnectedWallet ?
                          "Loading state..."
                          :
                          "Connect"
                        }
                      </button>
                    )
                  }

                  const isBusy = busyCourseId === course.id
                  
                  if (owned) {
                    return (
                      <div className="flex">
                        <Button
                          onClick={() => {alert("You are owner of the course")}} 
                          size="sm"
                          variant="white"
                          disabled={false}>
                          Yours &#10004;
                        </Button>
                        { owned.state === "deactivated" &&
                          <div className="ml-1">
                            <Button 
                              size="sm"
                              onClick={() => {
                                setIsNewPurchase(false)
                                setSelectedCourse(course)
                              }}
                              variant="purple"
                              disabled={isBusy}>
                              { isBusy ?
                                <div className="flex">
                                  <Loader size="sm" />
                                  <div className="ml-2">In Progress</div>
                                </div>
                                :
                                <div>Fund to Activated</div>
                              }
                            </Button>
                          </div>
                        }                   
                      </div>
                    )
                  }
                  return (
                    <Button 
                      size="sm"
                      variant="lightPurple"
                      onClick={() => setSelectedCourse(course)}
                      disabled={!hasConnectedWallet}>
                        { isBusy ?
                          <div className="flex">
                            <Loader size="sm" />
                            <div className="ml-2">In Progress</div>
                          </div>
                          :
                          <div>Purchase</div>
                        }
                    </Button>
                  )
                }
                }
              />
            )
          }
        }
      </CourseList>
      <OrderModal 
        course={selectedCourse}
        isNewPurchase={isNewPurchase} 
        onClose={cleanupModal}
        onSubmit={purchaseCourse
          // cleanupModal()
          // setSelectedCourse(null)
        }
      />
    </>
  )
}

export function getStaticProps() {
  const { data } = getAllCourses()
  return {
    props: {
      courses: data
    }
  }
}

Marketplace.Layout = BaseLayout