import React, { ReactNode } from 'react'
import { Section, ValueGroup } from '@admin-bro/design-system'

import convertParamsToArrayItems from './convert-params-to-array-items'
import PropertyJSON from '../../../types/property-json.interface'
import RecordJSON from '../../../types/record-json.interface'

type Props = {
  property: PropertyJSON;
  record: RecordJSON;
  ItemComponent: typeof React.Component;
}

export default class Show extends React.PureComponent<Props> {
  render(): ReactNode {
    const { property, record, ItemComponent } = this.props

    const items = convertParamsToArrayItems(property, record)

    return (
      <ValueGroup label={property.label}>
        <Section>
          {items.map((item, i) => (
            <ItemComponent
              {...this.props}
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              property={{
                ...property,
                name: `${property.name}.${i}`,
                label: `[${i + 1}]`,
                isArray: false,
              }}
            />
          ))}
        </Section>
      </ValueGroup>
    )
  }
}
