import React, { useCallback } from 'react'
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
import { AxiosResponse } from 'axios'
import { useLocation, useHistory } from 'react-router'

import ViewHelpers, {
  BulkActionParams,
  ResourceActionParams,
  RecordActionParams,
} from '../../backend/utils/view-helpers/view-helpers'


import { appendForceRefresh } from '../../frontend/components/actions/utils/append-force-refresh'
import ApiClient from '../../frontend/utils/api-client'

import { ActionResponse } from '../../backend/actions/action.interface'

import ActionJSON from '../types/action-json.interface'

import useNotice from './use-notice'

type DifferentActionParams = Omit<RecordActionParams, 'actionName'>
  | Omit<BulkActionParams, 'actionName'>
  | Omit<ResourceActionParams, 'actionName'>

type MergedActionParams = RecordActionParams & BulkActionParams & ResourceActionParams

export type ActionCallCallback = (action: ActionResponse) => any
export type UseActionResultCallApi<K extends ActionResponse> = () => Promise<AxiosResponse<K>>

export type UseActionResult<K extends ActionResponse> = {
  href: string;
  callApi: UseActionResultCallApi<K>;
  handleClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const h = new ViewHelpers()

const isRecordAction = (
  params: DifferentActionParams,
  action: ActionJSON,
): params is RecordActionParams => 'recordId' in params && action.actionType === 'record'

const isBulkAction = (
  params: DifferentActionParams,
  action: ActionJSON,
): params is BulkActionParams => 'recordIds' in params && action.actionType === 'bulk'

const isResourceAction = (
  params: DifferentActionParams,
  action: ActionJSON,
): params is ResourceActionParams => 'recordIds' in params && action.actionType === 'resource'

export function useAction<K extends ActionResponse>(
  action: ActionJSON,
  params: DifferentActionParams,
  onActionCall?: ActionCallCallback,
): UseActionResult<K> {
  const location = useLocation()
  const history = useHistory()
  const addNotice = useNotice()

  const { name: actionName } = action

  const {
    resourceId, recordId, recordIds,
  } = params as MergedActionParams

  const setHref = useCallback(() => {
    if (isRecordAction(params, action)) {
      return h.recordActionUrl({ ...params, actionName, search: location.search })
    }
    if (isBulkAction(params, action)) {
      return h.bulkActionUrl({ ...params, actionName, search: location.search })
    }
    if (isResourceAction(params, action)) {
      return h.resourceActionUrl({ resourceId, actionName, search: location.search })
    }
    throw new Error('"actionType" should be either record, resource or bulk')
  }, [resourceId, location, action])

  const href = setHref()

  const callApi = (): Promise<AxiosResponse<K>> => {
    const api = new ApiClient()
    let promise: Promise<AxiosResponse<K>>

    switch (action.actionType) {
    case 'record':
      if (!recordId) {
        throw new Error('You have to specify "recordId" for record action')
      }
      // TODO: change type from any - in general handle types for Action
      promise = api.recordAction({
        resourceId, actionName: action.name, recordId,
      }) as any
      break
    case 'resource':
      promise = api.resourceAction({
        resourceId, actionName: action.name,
      }) as any
      break
    case 'bulk':
      if (!recordIds) {
        throw new Error('You have to specify "recordIds" for bulk action')
      }
      promise = api.bulkAction({
        resourceId, actionName: action.name, recordIds,
      }) as any
      break
    default:
      throw new Error('"actionType" should be either record, resource or bulk')
    }

    promise.then((response) => {
      const { data } = response
      if (data.notice) {
        addNotice(data.notice)
      }
      if (data.redirectUrl && location.pathname !== data.redirectUrl) {
        const appended = appendForceRefresh(data.redirectUrl)
        history.push(appended)
      }
      if (onActionCall) {
        onActionCall(data)
      }
    }).catch((error) => {
      throw error
    })
    return promise
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    if (action.guard && !confirm(action.guard)) {
      return
    }
    if (typeof action.component !== 'undefined' && action.component === false) {
      callApi()
    } else {
      history.push(href)
    }
  }

  return {
    href,
    callApi,
    handleClick,
  }
}
