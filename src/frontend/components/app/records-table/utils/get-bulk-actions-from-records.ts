import RecordJSON from '../../../../types/record-json.interface'
import ActionJSON from '../../../../types/action-json.interface'

const getBulkActionsFromRecords = (records: Array<RecordJSON>): Array<ActionJSON> => {
  const actions = Object.values(records.reduce((memo, record) => ({
    ...memo,
    ...record.bulkActions.reduce((actionsMemo, action) => ({
      ...actionsMemo,
      [action.name]: action,
    }), {} as Record<string, ActionJSON>),
  }), {} as Record<string, ActionJSON>))
  return actions
}

export default getBulkActionsFromRecords
