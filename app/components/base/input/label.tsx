"use client";

import type { ReactNode, Ref } from "react";
import { HelpCircle } from "@untitledui/icons";
import type { LabelProps as AriaLabelProps } from "react-aria-components";
import { Label as AriaLabel } from "react-aria-components";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { cx } from "@/lib/utils/cx";

interface LabelProps extends AriaLabelProps {
    children: ReactNode;
    isRequired?: boolean;
    tooltip?: string;
    tooltipDescription?: string;
    ref?: Ref<HTMLLabelElement>;
}

export const Label = ({ isRequired, tooltip, tooltipDescription, className, ...props }: LabelProps) => {
    return (
        <div className="flex items-center gap-1">
            <AriaLabel
                // Used for conditionally hiding/showing the label element via CSS:
                // <Input label="Visible only on mobile" className="lg:**:data-label:hidden" />
                // or
                // <Input label="Visible only on mobile" className="lg:label:hidden" />
                data-label="true"
                {...props}
                className={cx("flex cursor-default items-center gap-0.5 text-sm font-medium text-foreground", className)}
            >
                {props.children}

                <span className={cx("hidden text-destructive", isRequired && "block", typeof isRequired === "undefined" && "group-required:block")}>*</span>
            </AriaLabel>

            {tooltip && (
                <Tooltip title={tooltip} description={tooltipDescription} placement="top">
                    <TooltipTrigger
                        // `TooltipTrigger` inherits the disabled state from the parent form field
                        // but we don't that. We want the tooltip be enabled even if the parent
                        // field is disabled.
                        isDisabled={false}
                        className="cursor-pointer text-muted-foreground transition duration-200 hover:text-foreground focus:text-foreground"
                    >
                        <HelpCircle className="size-4" />
                    </TooltipTrigger>
                </Tooltip>
            )}
        </div>
    );
};

Label.displayName = "Label";
