import { useAccount, useOwnedCourses, useWalletInfo } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Message } from "@components/ui/common";
import { OwnedCourseCard } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { MarketplaceHeader } from "@components/ui/marketplace";
import { getAllCourses } from "@content/courses/fetcher";
import Link from "next/link";
import { useRouter } from "next/router";

export default function OwnedCourses({courses}) {
  const router = useRouter()
  const { requireInstall } = useWeb3()
  const { account, network } = useWalletInfo()
  const { ownedCourses } = useOwnedCourses(courses, account, network)
  
  return(
    <>
      <MarketplaceHeader />
      <section className="grid grid-cols-1">
        { ownedCourses.isEmpty &&
          <div className="w-full sm:w-1/2">
            <Message type="warning">
              <div>You don&apos;t own any course</div>
              <Link href="/marketplace">
                <a className="font-normal hover:underline">
                  <i>Purchase Course</i>
                </a>
              </Link>
            </Message>
          </div>
        }
        {  account.isEmpty && 
          <div className="w-full sm:w-1/2">
            <Message type="warning">
              <div>Please connect to Metamask</div>
            </Message>
          </div>
        }
        {  requireInstall && 
          <div className="w-full sm:w-1/2">
            <Message type="warning">
              <div>Please install Metamask</div>
            </Message>
          </div>
        }
        { ownedCourses.data?.map( course => 
          <OwnedCourseCard
            key={course.id}
            course={course}
          >
            <Button 
              onClick={() => router.push(`/courses/${course.slug}`)}>
              Watch the course
            </Button>
          </OwnedCourseCard>)
        }
      </section>
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

OwnedCourses.Layout = BaseLayout