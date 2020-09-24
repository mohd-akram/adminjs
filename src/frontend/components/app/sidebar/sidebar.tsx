import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { Box, cssClass, themeGet } from '@admin-bro/design-system'

import { BrandingOptions } from 'src/admin-bro-options.interface'
import ResourceJSON from 'src/frontend/types/resource-json.interface'
import PageJSON from 'src/frontend/types/page-json.interface'
import SidebarBranding from './sidebar-branding'
import SidebarPages from './sidebar-pages'
import { ReduxState } from '../../../store/store'
import SidebarFooter from './sidebar-footer'

import SidebarResourceSection from './sidebar-resource-section'

type Props = {
  isVisible: boolean;
}

const StyledSidebar = styled(Box)`
  transition: left 0.3s;
  top: 0;
  bottom: 0;

  &.hidden {
    left: -${themeGet('sizes', 'sidebarWidth')};
  }
  &.visible {
    left: 0;
  }
`

StyledSidebar.defaultProps = {
  position: ['absolute', 'absolute', 'absolute', 'absolute', 'inherit'],
  width: 'sidebarWidth',
  borderRight: 'default',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1000,
  bg: 'white',
}

const Sidebar: React.FC<Props> = (props) => {
  const { isVisible } = props
  const [branding, resources, pages]: [BrandingOptions, ResourceJSON[], PageJSON[]] = useSelector(
    (state: ReduxState) => [
      state.branding, state.resources, state.pages,
    ],
  )

  return (
    <StyledSidebar
      className={isVisible ? 'visible' : 'hidden'}
    >
      <SidebarBranding branding={branding} />
      <Box flexGrow={1} className={cssClass('Resources')}>
        <SidebarResourceSection resources={resources} />
      </Box>
      <SidebarPages pages={pages} />
      {branding?.softwareBrothers && <SidebarFooter />}
    </StyledSidebar>
  )
}

export default Sidebar
