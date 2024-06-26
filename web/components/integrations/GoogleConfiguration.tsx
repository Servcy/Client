import Image from "next/image.js"

import { useEffect, useState } from "react"

import { Input, Select } from "antd"
import toast from "react-hot-toast"
import { MdOutlineSyncAlt } from "react-icons/md"

import IntegrationService from "@services/integration.service"

import type { Integration, UserIntegration } from "@servcy/types"
import { Button } from "@servcy/ui"

const integrationService = new IntegrationService()

export default function GoogleConfiguration({ selectedIntegration }: { selectedIntegration: Integration }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [saving, setSaving] = useState<boolean>(false)
    const [whitelistedEmails, setWhitelistedEmails] = useState<Set<string>>(new Set([""]))
    const [userIntegrationId, setUserIntegrationId] = useState<number>(0)
    const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([])

    useEffect(() => {
        setLoading(true)
        setUserIntegrationId(selectedIntegration.id)
        integrationService
            .fetchUserIntegrations("Gmail")
            .then((response) => {
                setUserIntegrations(response)
                if (response.length === 1) {
                    setUserIntegrationId(response[0].id)
                    response[0].configuration &&
                        setWhitelistedEmails(new Set(response[0].configuration.whitelisted_emails))
                }
            })
            .catch(() => {
                toast.error("Please try again later")
            })
            .finally(() => {
                setLoading(false)
            })
    }, [selectedIntegration.id])

    useEffect(() => {
        const userIntegration = userIntegrations.find((userIntegration) => userIntegration.id === userIntegrationId)
        if (userIntegration) {
            if (!userIntegration.configuration) setWhitelistedEmails(new Set([""]))
            else setWhitelistedEmails(new Set(userIntegration.configuration.whitelisted_emails))
        }
    }, [userIntegrationId, userIntegrations])

    const configureGoogle = async () => {
        const nonEmptyWhitelistedEmails = new Set(whitelistedEmails)
        nonEmptyWhitelistedEmails.delete("")
        if (nonEmptyWhitelistedEmails.size === 0) {
            toast.error("Please enter atleast one email ID")
            return
        }
        setSaving(true)
        integrationService
            .configureUserIntegration(
                userIntegrationId,
                {
                    whitelisted_emails: Array.from(nonEmptyWhitelistedEmails),
                },
                "Gmail"
            )
            .catch(() => {
                toast.error("Please try again later")
            })
            .finally(() => {
                setSaving(false)
            })
    }

    return (
        <div className="flex min-h-[300px] flex-col rounded-lg border border-custom-servcy-gray bg-custom-background-80 p-6 text-custom-servcy-white shadow-md md:flex-row">
            <div className="w-full flex-col p-4">
                <div className="flex text-xl font-semibold">
                    <Image
                        className="my-auto h-[40px] min-h-[40px] min-w-[40px] max-w-[40px] rounded-lg border border-custom-servcy-gray bg-custom-servcy-white p-1"
                        src="https://servcy-public.s3.amazonaws.com/gmail.svg"
                        width={40}
                        height={40}
                        alt="Gmail Logo"
                    />
                    <MdOutlineSyncAlt className="mx-2 my-auto" color="grey" size={20} />
                    <Image
                        className="my-auto mr-5 max-h-[40px] min-h-[40px] min-w-[40px] max-w-[40px] rounded-lg border border-custom-servcy-gray p-1"
                        src="https://servcy-public.s3.amazonaws.com/logo.svg"
                        width={40}
                        height={40}
                        alt="Servcy Logo"
                    />
                    <div className="my-auto">Google Integration Setup</div>
                </div>
                {loading ? (
                    <div className="mb-2.5 ml-auto mt-8 h-5 animate-pulse rounded-full bg-custom-servcy-white" />
                ) : (
                    <Select
                        className="mt-8 w-full"
                        id="user_integration_id"
                        placeholder="Select Account"
                        value={userIntegrationId}
                        onChange={(e: any) => {
                            setUserIntegrationId(Number.parseInt(e.target.value))
                        }}
                    >
                        {userIntegrations.length === 0 ? (
                            <Select.Option value={0} className="capitalize" key={0}>
                                No accounts found
                            </Select.Option>
                        ) : (
                            userIntegrations.map((userIntegration) => (
                                <Select.Option
                                    key={userIntegration.id}
                                    value={userIntegration.id}
                                    className="capitalize"
                                >
                                    {userIntegration.account_display_name}
                                </Select.Option>
                            ))
                        )}
                    </Select>
                )}
                <section className="mt-8">
                    <span className="font-sans text-lg font-semibold">
                        Only emails from the whitelisted addresses will be shown in inbox:
                    </span>
                    <ul className="mt-4 list-inside font-serif text-sm font-light">
                        <li className="mb-4">You can provide exact email addresses</li>
                        <li>
                            You can also use following wildcard entries, *@company.com to allow all emails from this
                            company, *@* to allow all emails
                        </li>
                    </ul>
                </section>
            </div>
            <div className="w-full flex-col p-4">
                <form className="flex flex-col gap-4">
                    <div>
                        {loading ? (
                            <>
                                <span>Whitelisted Email IDs</span>
                                <div className="my-3 h-5 animate-pulse rounded-full bg-custom-servcy-white" />
                                <span className="mt-5">Email ID</span>
                                <div className="my-3 h-5 animate-pulse rounded-full bg-custom-servcy-white" />
                            </>
                        ) : (
                            Array.from(whitelistedEmails).map((emailId, index) => (
                                <div key={index} className="py-2">
                                    <span>Whitelisted Email IDs</span>
                                    <Input
                                        value={emailId}
                                        placeholder="Enter email ID"
                                        className="my-3 p-1"
                                        onChange={(e) => {
                                            const newWhitelistedEmails = new Set(whitelistedEmails)
                                            newWhitelistedEmails.delete(emailId)
                                            newWhitelistedEmails.add(e.target.value)
                                            setWhitelistedEmails(newWhitelistedEmails)
                                        }}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                    {!loading && (
                        <>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        if (whitelistedEmails.has("")) return
                                        const newWhitelistedEmails = new Set(whitelistedEmails)
                                        newWhitelistedEmails.add("")
                                        setWhitelistedEmails(newWhitelistedEmails)
                                    }}
                                    variant="outline-primary"
                                    disabled={saving}
                                >
                                    + Add More
                                </Button>
                            </div>
                            <Button
                                loading={saving}
                                disabled={saving}
                                onClick={() => configureGoogle()}
                                variant="primary"
                            >
                                Submit
                            </Button>
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}
