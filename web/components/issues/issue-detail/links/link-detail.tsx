import { FC, useState } from "react"

import { LinkIcon, Pencil, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

import { useIssueDetail, useMember } from "@hooks/store"

import { calculateTimeAgo } from "@helpers/date-time.helper"
import { copyTextToClipboard } from "@helpers/string.helper"

import { ExternalLinkIcon, Tooltip } from "@servcy/ui"

import { IssueLinkCreateUpdateModal, TLinkOperationsModal } from "./create-update-link-modal"

export type TIssueLinkDetail = {
    linkId: string
    linkOperations: TLinkOperationsModal
    isNotAllowed: boolean
}

export const IssueLinkDetail: FC<TIssueLinkDetail> = (props) => {
    // props
    const { linkId, linkOperations, isNotAllowed } = props

    const {
        toggleIssueLinkModal: toggleIssueLinkModalStore,
        link: { getLinkById },
    } = useIssueDetail()
    const { getUserDetails } = useMember()

    // state
    const [isIssueLinkModalOpen, setIsIssueLinkModalOpen] = useState(false)
    const toggleIssueLinkModal = (modalToggle: boolean) => {
        toggleIssueLinkModalStore(modalToggle)
        setIsIssueLinkModalOpen(modalToggle)
    }

    const linkDetail = getLinkById(linkId)
    if (!linkDetail) return <></>

    const createdByDetails = getUserDetails(linkDetail.created_by_id)

    return (
        <div key={linkId}>
            <IssueLinkCreateUpdateModal
                isModalOpen={isIssueLinkModalOpen}
                handleModal={toggleIssueLinkModal}
                linkOperations={linkOperations}
                preloadedData={linkDetail}
            />

            <div className="relative flex flex-col rounded-md bg-custom-background-90 p-2.5">
                <div
                    className="flex w-full items-start justify-between gap-2 cursor-pointer"
                    onClick={() => {
                        copyTextToClipboard(linkDetail.url)
                        toast.success("Copied to clipboard")
                    }}
                >
                    <div className="flex items-start gap-2 truncate">
                        <span className="py-1">
                            <LinkIcon className="h-3 w-3 flex-shrink-0" />
                        </span>
                        <Tooltip
                            tooltipContent={
                                linkDetail.title && linkDetail.title !== "" ? linkDetail.title : linkDetail.url
                            }
                        >
                            <span className="truncate text-xs">
                                {linkDetail.title && linkDetail.title !== "" ? linkDetail.title : linkDetail.url}
                            </span>
                        </Tooltip>
                    </div>

                    {!isNotAllowed && (
                        <div className="z-[1] flex flex-shrink-0 items-center gap-2">
                            <button
                                type="button"
                                className="flex items-center justify-center p-1 hover:bg-custom-background-80"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleIssueLinkModal(true)
                                }}
                            >
                                <Pencil className="h-3 w-3 stroke-[1.5] text-custom-text-200" />
                            </button>
                            <a
                                href={linkDetail.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center p-1 hover:bg-custom-background-80"
                            >
                                <ExternalLinkIcon className="h-3 w-3 stroke-[1.5] text-custom-text-200" />
                            </a>
                            <button
                                type="button"
                                className="flex items-center justify-center p-1 hover:bg-custom-background-80"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    linkOperations.remove(linkDetail.id)
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-5">
                    <p className="mt-0.5 stroke-[1.5] text-xs text-custom-text-300">
                        Added {calculateTimeAgo(linkDetail.created_at)}
                        <br />
                        {createdByDetails && <>by {createdByDetails?.display_name}</>}
                    </p>
                </div>
            </div>
        </div>
    )
}
