import Image from "next/image"

import React from "react"

import { NextPageWithLayout } from "@/types/index"
import { observer } from "mobx-react-lite"
import ServcyLogo from "public/logo.png"

import { SignUpRoot } from "@components/account"
import { PageHead } from "@components/core"

import { useApplication, useUser } from "@hooks/store"

import DefaultLayout from "@layouts/DefaultLayout"

import { Spinner } from "@servcy/ui"

const SignUpPage: NextPageWithLayout = observer(() => {
    // store hooks
    const {
        config: { envConfig },
    } = useApplication()
    const { currentUser } = useUser()

    if (currentUser || !envConfig)
        return (
            <div className="grid h-screen place-items-center">
                <Spinner />
            </div>
        )

    return (
        <>
            <PageHead title="Sign Up" />
            <div className="h-full w-full bg-onboarding-gradient-100">
                <div className="flex items-center justify-between px-8 pb-4 sm:px-16 sm:py-5 lg:px-28">
                    <div className="flex items-center gap-x-2 py-10">
                        <Image src={ServcyLogo} height={30} width={30} alt="Servcy Logo" className="mr-2" />
                        <span className="text-2xl font-semibold sm:text-3xl">Servcy</span>
                    </div>
                </div>

                <div className="mx-auto h-full rounded-t-md border-x border-t border-custom-border-200 bg-onboarding-gradient-100 px-4 pt-4 shadow-sm sm:w-4/5 md:w-2/3">
                    <div className="h-full overflow-auto rounded-t-md bg-onboarding-gradient-200 px-7 pb-56 pt-24 sm:px-0">
                        <SignUpRoot />
                    </div>
                </div>
            </div>
        </>
    )
})

SignUpPage.getWrapper = function getWrapper(page: React.ReactElement) {
    return <DefaultLayout>{page}</DefaultLayout>
}

export default SignUpPage
