/** Message Edit browser half: Timeline view and compact conversation-header controls. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// Type-only side-effect imports: pull the Context/Event/SlotMap declaration
// merging that types this plugin's ctx and slot registrations. All erased at
// build time, so none of them reach the module table.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import { MESSAGE_EDIT_VIEW_ORDER } from '../shared.ts'
import { MessageEditController } from './controller.ts'
import { MessageEditHeader } from './MessageEditHeader.tsx'
import { MessageEditTimelineView } from './MessageEditTimelineView.tsx'

/** Explicit value sources and slot declaration-order edges. */
export const inject = ['slots', 'conversation', 'uiConversation', 'connection', 'sessions', 'uiWorkspace']

/** Register both UI contributions over one per-session controller identity. */
export function apply(ctx: ClientContext): void {
  const controllers = new Map<SessionId, MessageEditController>()
  const controllerFor = (sessionId: SessionId): MessageEditController => {
    let controller = controllers.get(sessionId)
    if (controller === undefined) {
      controller = new MessageEditController(ctx, sessionId)
      controllers.set(sessionId, controller)
    }
    return controller
  }

  ctx.on('connection/reset', () => {
    for (const controller of controllers.values()) controller.refreshIfLoaded()
  })

  // The inject factory parameter is contextually typed by the slot declaration
  // (SessionIdOf); the cast keeps it valid whether or not ui-session's standard
  // props merge is in scope.
  ctx.slots.register({
    name: 'conversation.view',
    id: 'message-edit-timeline',
    order: MESSAGE_EDIT_VIEW_ORDER,
    label: 'Timeline',
    inject: sessionId => controllerFor(sessionId as SessionId).face,
  }, MessageEditTimelineView)

  ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'message-edit-controls',
    order: MESSAGE_EDIT_VIEW_ORDER,
    inject: sessionId => controllerFor(sessionId as SessionId).face,
  }, MessageEditHeader)
}
