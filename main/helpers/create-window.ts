import {
  screen,
  BrowserWindow,
  BrowserWindowConstructorOptions,
} from 'electron'
import Store from 'electron-store'

export const createWindow = (
  windowName: string,
  options: BrowserWindowConstructorOptions
): BrowserWindow => {
  const key = 'window-state'
  const name = `window-state-${windowName}`
  const store = new Store<Record<string, any>>({ name })
  const getSafeDefaultSize = () => {
    const workArea = screen.getPrimaryDisplay().workArea
    const targetWidth = Math.min(options.width ?? 1200, workArea.width)
    const targetHeight = Math.min(options.height ?? 800, workArea.height)
    return {
      width: targetWidth,
      height: targetHeight,
    }
  }
  let state: Record<string, any> = {}

  const restore = () => store.get(key, getSafeDefaultSize())

  const getCurrentPosition = () => {
    const position = win.getPosition()
    const size = win.getSize()
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    }
  }

  const windowWithinBounds = (windowState: any, bounds: any) => {
    return (
      typeof windowState.x === 'number' &&
      typeof windowState.y === 'number' &&
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    )
  }

  const resetToDefaults = () => {
    const workArea = screen.getPrimaryDisplay().workArea
    const safeSize = getSafeDefaultSize()
    return Object.assign({}, safeSize, {
      x: workArea.x + Math.max(0, Math.floor((workArea.width - safeSize.width) / 2)),
      y: workArea.y + Math.max(0, Math.floor((workArea.height - safeSize.height) / 2)),
    })
  }

  const ensureVisibleOnSomeDisplay = (windowState: any) => {
    const visible = screen.getAllDisplays().some((display) => {
      return windowWithinBounds(windowState, display.workArea)
    })
    if (!visible) {
      return resetToDefaults()
    }
    return windowState
  }

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition())
    }
    store.set(key, state)
  }

  state = ensureVisibleOnSomeDisplay(restore())

  const win = new BrowserWindow({
    ...state,
    ...options,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      ...options.webPreferences,
    },
  })

  win.on('close', saveState)

  return win
}
