import { FC, useEffect, useState } from "react"

import { Disclosure, Transition } from "@headlessui/react"
import { ChevronDown, ChevronUp, Pencil } from "lucide-react"
import { observer } from "mobx-react-lite"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"

import { WorkspaceImageUploadModal } from "@components/core"
import { DeleteWorkspaceModal } from "@components/workspace"

import { useEventTracker, useUser, useWorkspace } from "@hooks/store"

import { WORKSPACE_UPDATED } from "@constants/event-tracker"
import { ERoles } from "@constants/iam"

import { FileService } from "@services/document.service"

import { copyUrlToClipboard } from "@helpers/string.helper"

import { IWorkspace } from "@servcy/types"
import { Button, Input, Spinner } from "@servcy/ui"

const defaultValues: Partial<IWorkspace> = {
    name: "",
    url: "",
    logo: null,
}

const fileService = new FileService()

export const WorkspaceDetails: FC = observer(() => {
    // states
    const [isLoading, setIsLoading] = useState(false)
    const [deleteWorkspaceModal, setDeleteWorkspaceModal] = useState(false)
    const [isImageRemoving, setIsImageRemoving] = useState(false)
    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false)
    // store hooks
    const { captureWorkspaceEvent } = useEventTracker()
    const {
        membership: { currentWorkspaceRole },
    } = useUser()
    const { currentWorkspace, updateWorkspace } = useWorkspace()

    // form info
    const {
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm<IWorkspace>({
        defaultValues: { ...defaultValues, ...currentWorkspace },
    })

    const onSubmit = async (formData: IWorkspace) => {
        if (!currentWorkspace) return

        setIsLoading(true)

        const payload: Partial<IWorkspace> = {
            logo: formData.logo,
            name: formData.name,
        }

        await updateWorkspace(currentWorkspace.slug, payload)
            .then((res) => {
                captureWorkspaceEvent({
                    eventName: WORKSPACE_UPDATED,
                    payload: {
                        ...res,
                        state: "SUCCESS",
                        element: "Workspace general settings page",
                    },
                })
            })
            .catch(() => {
                captureWorkspaceEvent({
                    eventName: WORKSPACE_UPDATED,
                    payload: {
                        state: "FAILED",
                        element: "Workspace general settings page",
                    },
                })
            })
        setTimeout(() => {
            setIsLoading(false)
        }, 300)
    }

    const handleRemoveLogo = () => {
        if (!currentWorkspace) return

        const url = currentWorkspace.logo

        if (!url) return

        setIsImageRemoving(true)

        fileService.deleteFile(url).then(() => {
            updateWorkspace(currentWorkspace.slug, { logo: null })
                .then(() => {
                    setIsImageUploadModalOpen(false)
                })
                .catch(() => {
                    toast.error("Please try again later")
                })
                .finally(() => setIsImageRemoving(false))
        })
    }

    const handleCopyUrl = () => {
        if (!currentWorkspace) return
        copyUrlToClipboard(`${currentWorkspace.slug}`).then(() => toast.success("Copied to clipboard"))
    }

    useEffect(() => {
        if (currentWorkspace) reset({ ...currentWorkspace })
    }, [currentWorkspace, reset])

    const isAdmin = currentWorkspaceRole === ERoles.ADMIN

    if (!currentWorkspace)
        return (
            <div className="grid h-full w-full place-items-center px-4 sm:px-0">
                <Spinner />
            </div>
        )

    return (
        <>
            <DeleteWorkspaceModal
                data={currentWorkspace}
                isOpen={deleteWorkspaceModal}
                onClose={() => setDeleteWorkspaceModal(false)}
            />
            <Controller
                control={control}
                name="logo"
                render={({ field: { onChange, value } }) => (
                    <WorkspaceImageUploadModal
                        isOpen={isImageUploadModalOpen}
                        onClose={() => setIsImageUploadModalOpen(false)}
                        isRemoving={isImageRemoving}
                        handleRemove={handleRemoveLogo}
                        onSuccess={(imageUrl) => {
                            onChange(imageUrl)
                            setIsImageUploadModalOpen(false)
                            handleSubmit(onSubmit)()
                        }}
                        value={value}
                    />
                )}
            />
            <div className={`w-full overflow-y-auto py-8 pr-9 ${isAdmin ? "" : "opacity-60"}`}>
                <div className="flex items-center gap-5 border-b border-custom-border-100 pb-7">
                    <div className="flex flex-col gap-1">
                        <button type="button" onClick={() => setIsImageUploadModalOpen(true)} disabled={!isAdmin}>
                            {watch("logo") && watch("logo") !== null && watch("logo") !== "" ? (
                                <div className="relative mx-auto flex h-14 w-14">
                                    <img
                                        src={watch("logo")!}
                                        className="absolute left-0 top-0 h-full w-full rounded-md object-cover"
                                        alt="Workspace Logo"
                                    />
                                </div>
                            ) : (
                                <div className="relative flex h-14 w-14 items-center justify-center rounded bg-gray-700 p-4 uppercase text-white">
                                    {currentWorkspace?.name?.charAt(0) ?? "N"}
                                </div>
                            )}
                        </button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold leading-6">{watch("name")}</h3>
                        <button type="button" onClick={handleCopyUrl} className="text-sm tracking-tight">{`${
                            typeof window !== "undefined" &&
                            window.location.origin.replace("http://", "").replace("https://", "")
                        }/${currentWorkspace.slug}`}</button>
                        {isAdmin && (
                            <button
                                className="flex items-center gap-1.5 text-left text-xs font-medium text-custom-primary-100"
                                onClick={() => setIsImageUploadModalOpen(true)}
                            >
                                {watch("logo") && watch("logo") !== null && watch("logo") !== "" ? (
                                    <>
                                        <Pencil className="h-3 w-3" />
                                        Edit logo
                                    </>
                                ) : (
                                    "Upload logo"
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="my-10 flex flex-col gap-8">
                    <div className="grid-col grid w-full grid-cols-1 items-center justify-between gap-10 xl:grid-cols-2 2xl:grid-cols-3">
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm">Workspace name</h4>
                            <Controller
                                control={control}
                                name="name"
                                rules={{
                                    required: "Name is required",
                                    maxLength: {
                                        value: 80,
                                        message: "Workspace name should not exceed 80 characters",
                                    },
                                }}
                                render={({ field: { value, onChange, ref } }) => (
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={value}
                                        onChange={onChange}
                                        ref={ref}
                                        hasError={Boolean(errors.name)}
                                        placeholder="Name"
                                        className="w-full rounded-md font-medium"
                                        disabled={!isAdmin}
                                    />
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-1 ">
                            <h4 className="text-sm">Workspace URL</h4>
                            <Controller
                                control={control}
                                name="url"
                                render={({ field: { onChange, ref } }) => (
                                    <Input
                                        id="url"
                                        name="url"
                                        type="url"
                                        value={`${
                                            typeof window !== "undefined" &&
                                            window.location.origin.replace("http://", "").replace("https://", "")
                                        }/${currentWorkspace.slug}`}
                                        onChange={onChange}
                                        ref={ref}
                                        hasError={Boolean(errors.url)}
                                        className="w-full"
                                        disabled
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="flex items-center justify-between py-2">
                            <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isLoading}>
                                {isLoading ? "Updating..." : "Update Workspace"}
                            </Button>
                        </div>
                    )}
                </div>
                {isAdmin && (
                    <Disclosure as="div" className="border-t border-custom-border-100">
                        {({ open }) => (
                            <div className="w-full">
                                <Disclosure.Button
                                    as="button"
                                    type="button"
                                    className="flex w-full items-center justify-between py-4"
                                >
                                    <span className="text-lg tracking-tight">Delete Workspace</span>
                                    {/* <Icon iconName={open ? "expand_less" : "expand_more"} className="!text-2xl" /> */}
                                    {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </Disclosure.Button>

                                <Transition
                                    show={open}
                                    enter="transition duration-100 ease-out"
                                    enterFrom="transform opacity-0"
                                    enterTo="transform opacity-100"
                                    leave="transition duration-75 ease-out"
                                    leaveFrom="transform opacity-100"
                                    leaveTo="transform opacity-0"
                                >
                                    <Disclosure.Panel>
                                        <div className="flex flex-col gap-8">
                                            <span className="text-sm tracking-tight">
                                                The danger zone of the workspace delete page is a critical area that
                                                requires careful consideration and attention. When deleting a workspace,
                                                all of the data and resources within that workspace will be permanently
                                                removed and cannot be recovered.
                                            </span>
                                            <div>
                                                <Button variant="danger" onClick={() => setDeleteWorkspaceModal(true)}>
                                                    Delete my workspace
                                                </Button>
                                            </div>
                                        </div>
                                    </Disclosure.Panel>
                                </Transition>
                            </div>
                        )}
                    </Disclosure>
                )}
            </div>
        </>
    )
})
