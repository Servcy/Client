import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { IIssueDisplayProperties } from "@servcy/types";

interface IWithDisplayPropertiesHOC {
  displayProperties: IIssueDisplayProperties;
  shouldRenderProperty?: (displayProperties: IIssueDisplayProperties) => boolean;
  displayPropertyKey: keyof IIssueDisplayProperties | (keyof IIssueDisplayProperties)[];
  children: ReactNode;
}

export const WithDisplayPropertiesHOC = observer(
  ({ displayProperties, shouldRenderProperty, displayPropertyKey, children }: IWithDisplayPropertiesHOC) => {
    let shouldDisplayPropertyFromFilters = false;
    if (Array.isArray(displayPropertyKey))
      shouldDisplayPropertyFromFilters = displayPropertyKey.every((key) => !!displayProperties[key]);
    else shouldDisplayPropertyFromFilters = !!displayProperties[displayPropertyKey];

    const renderProperty =
      shouldDisplayPropertyFromFilters && (shouldRenderProperty ? shouldRenderProperty(displayProperties) : true);

    if (!renderProperty) return null;

    return <>{children}</>;
  }
);