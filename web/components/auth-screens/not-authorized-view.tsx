import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

import React from "react"

import { observer } from "mobx-react-lite"
import ProjectNotAuthorizedImg from "public/auth/project-not-authorized.svg"
import WorkspaceNotAuthorizedImg from "public/auth/workspace-not-authorized.svg"

import { useUser } from "@hooks/store"

import NoSidebarWrapper from "@wrappers/NoSidebarWrapper"

type Props = {
    actionButton?: React.ReactNode
    type: "project" | "workspace"
}

export const NotAuthorizedView: React.FC<Props> = observer((props) => {
    const { actionButton, type } = props
    const { currentUser } = useUser()
    const { nextUrl } = useParams()

    return (
        <NoSidebarWrapper>
            <div className="flex h-full w-full flex-col items-center justify-center gap-y-5 bg-custom-background-100 text-center">
                <div className="h-44 w-72">
                    <Image
                        src={type === "project" ? ProjectNotAuthorizedImg : WorkspaceNotAuthorizedImg}
                        height="176"
                        width="288"
                        alt="ProjectSettingImg"
                    />
                </div>
                <h1 className="text-xl font-medium text-custom-text-100">
                    Oops! You are not authorized to view this page
                </h1>

                <div className="w-full max-w-md text-base text-custom-text-200">
                    {currentUser ? (
                        <p>
                            You have signed in as {currentUser.email}. <br />
                            <Link href={`/?nextUrl=${nextUrl}`}>
                                <span className="font-medium text-custom-text-100">Sign in</span>
                            </Link>{" "}
                            with different account that has access to this page.
                        </p>
                    ) : (
                        <p>
                            You need to{" "}
                            <Link href={`/?nextUrl=${nextUrl}`}>
                                <span className="font-medium text-custom-text-100">Sign in</span>
                            </Link>{" "}
                            with an account that has access to this page.
                        </p>
                    )}
                </div>

                {actionButton}
            </div>
        </NoSidebarWrapper>
    )
})
