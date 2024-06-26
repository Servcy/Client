"use client"

import Image from "next/image.js"

import { useEffect, useState } from "react"

import { Card, Skeleton, Tag } from "antd"
import { observer } from "mobx-react"
import toast from "react-hot-toast"
import { AiOutlineSetting } from "react-icons/ai"
import { HiArrowsRightLeft } from "react-icons/hi2"

import { PageHead } from "@components/core"
import { IntegrationsHeader } from "@components/headers/integrations"
import IntegrationConfigurationModal from "@components/integrations/IntegrationConfigurationModal"

import { integrationCategories } from "@constants/integration"

import IntegrationService from "@services/integration.service"

import DefaultWrapper from "@wrappers/DefaultWrapper"

import { getQueryParams } from "@helpers/common.helper"
import { oauthUrlGenerators } from "@helpers/integration.helper"
import { capitalizeFirstLetter } from "@helpers/string.helper"

import type { Integration } from "@servcy/types"
import { Button } from "@servcy/ui"

const integrationService = new IntegrationService()

const Integrations = observer(() => {
    const [integrations, setIntegrations] = useState<Integration[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("")
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
    const [category, setCategory] = useState<string>("")

    useEffect(() => {
        setLoading(true)
        const queryParams: Record<string, string> = getQueryParams(window.location.search)
        integrationService
            .fetchIntegrations()
            .then((results) => {
                const integrationsToBeShown = results.filter((integration: Integration) => integration.to_be_shown)
                setIntegrations(integrationsToBeShown)
                if (queryParams["integration"]) {
                    const integration = integrationsToBeShown.find(
                        (integration: Integration) => integration.id === Number(queryParams["integration"])
                    )
                    if (integration) {
                        setTimeout(() => {
                            // click on the connect button
                            const connectButton = document.getElementById(`connect-${integration.id}`)
                            if (connectButton) {
                                connectButton.click()
                            }
                        }, 1000)
                    }
                }
                if (queryParams["selectedIntegration"] && queryParams["openConfigurationModal"]) {
                    const integration = integrationsToBeShown.find(
                        (integration: Integration) =>
                            integration.name === capitalizeFirstLetter(queryParams["selectedIntegration"] ?? "")
                    )
                    if (integration) {
                        setIsModalVisible(true)
                        setSelectedIntegration(integration)
                    }
                }
            })
            .catch(() => {
                toast.error("Please try again later")
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const connect = (integration: Integration) => {
        const oauthUrlGenerator = oauthUrlGenerators[integration.name]
        if (oauthUrlGenerator) {
            window.location.href = oauthUrlGenerator(window.location.href)
        }
    }

    return (
        <DefaultWrapper header={<IntegrationsHeader search={search} setSearch={setSearch} setCategory={setCategory} />}>
            <PageHead title="Integrations" />
            <div className="p-6">
                <section className="xs:grid-cols-1 grid gap-3 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 max-h-[80vh] overflow-y-scroll">
                    {loading ? (
                        <>
                            <Card className="min-h-[200px] animate-pulse rounded-l bg-custom-background-90 border-[0.5px] border-custom-border-200 hover:shadow-custom-shadow-4xlg">
                                <Skeleton avatar paragraph={{ rows: 4 }} />
                            </Card>
                            <Card className="min-h-[200px] animate-pulse rounded-lg bg-custom-background-90 border-[0.5px] border-custom-border-200 hover:shadow-custom-shadow-4xl">
                                <Skeleton avatar paragraph={{ rows: 4 }} />
                            </Card>
                            <Card className="min-h-[200px] animate-pulse rounded-lg bg-custom-background-90 border-[0.5px] border-custom-border-200 hover:shadow-custom-shadow-4xl">
                                <Skeleton avatar paragraph={{ rows: 4 }} />
                            </Card>
                        </>
                    ) : (
                        integrations
                            .filter(
                                (integration) =>
                                    (search === "" || integration.name.toLowerCase().includes(search.toLowerCase())) &&
                                    (!category || integrationCategories[integration.name]?.includes(category))
                            )
                            .map((integration: Integration) => (
                                <Card
                                    key={integration.id}
                                    id={`integration-${integration.id}`}
                                    className="min-h-[200px] rounded-lg bg-custom-background-90 border-[0.5px] border-custom-border-200 hover:shadow-custom-shadow-4xl"
                                >
                                    <div className="flex flex-row items-center">
                                        <div className="flex overflow-x-hidden">
                                            {integration.logo.split(",").map((logo, index) => (
                                                <Image
                                                    className="my-auto mr-2 max-h-[40px] min-h-[40px] min-w-[40px] max-w-[40px] rounded-lg border-[0.5px] border-custom-border-200 p-1 last-of-type:mr-5"
                                                    src={logo}
                                                    width={40}
                                                    key={`logo-${index}`}
                                                    height={40}
                                                    alt={integration.name}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex-col pl-4 text-lg font-semibold text-custom-text-200">
                                            {integration.name}
                                        </div>
                                    </div>
                                    <div className="mt-2 py-3 pr-3 text-xs text-custom-text-100">
                                        {integration.description}
                                    </div>
                                    <div className="mt-2 h-10 py-3 pr-3">
                                        {integrationCategories[integration.name] !== undefined
                                            ? integrationCategories[integration.name]?.map(
                                                  (category: string, index: number) => (
                                                      <Tag
                                                          key={`category-${index}`}
                                                          className="mr-1 font-bold"
                                                          bordered={false}
                                                      >
                                                          {category.charAt(0).toUpperCase() + category.slice(1)}
                                                      </Tag>
                                                  )
                                              )
                                            : null}
                                    </div>
                                    <div className="mt-6 flex flex-row justify-between">
                                        <Button
                                            size="md"
                                            id={`connect-${integration.id}`}
                                            onClick={() => connect(integration)}
                                            variant="outline-primary"
                                        >
                                            <HiArrowsRightLeft /> Connect
                                        </Button>
                                        {integration.is_connected && (
                                            <Button
                                                onClick={() => {
                                                    setSelectedIntegration(integration)
                                                    setIsModalVisible(true)
                                                }}
                                                variant="outline-primary"
                                                className="max-sm:hidden"
                                            >
                                                <AiOutlineSetting /> Settings
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))
                    )}
                </section>
                {isModalVisible && selectedIntegration !== null && (
                    <IntegrationConfigurationModal
                        onClose={() => {
                            setIsModalVisible(false)
                            setSelectedIntegration(null)
                        }}
                        selectedIntegration={selectedIntegration}
                    />
                )}
            </div>
        </DefaultWrapper>
    )
})

export default Integrations
