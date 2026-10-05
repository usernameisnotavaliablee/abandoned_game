import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const ENABLE_BOOT_SCREEN = false // 改为 true 即可启用开机画面

const ICON_PATHS = {
  computer:     '/assets/xp/MyComputer.png',
  recycle:      '/assets/xp/RecycleBin(empty).png',
  folder:       '/assets/xp/FolderClosed.png',
  mydocs:       '/assets/xp/MyDocuments.png',
  text:         '/assets/xp/GenericTextDocument.png',
  notepad:      '/assets/xp/Notepad.png',
  ie:           '/assets/xp/InternetExplorer6.png',
  controlpanel: '/assets/xp/ControlPanel.png',
  search:       '/assets/xp/Search.png',
  run:          '/assets/xp/Run.png',
  volume:       '/assets/xp/Volume.png',
}

const desktopItems = [
  { id: 'battle',   label: 'Code Battle', caption: '微软大战代码', icon: 'battle',   window: 'battle' },
  { id: 'computer', label: '我的电脑',    caption: 'My Computer',  icon: 'computer', window: 'computer' },
  { id: 'recycle',  label: '回收站',     caption: 'Recycle Bin',   icon: 'recycle',  window: 'recycle' },
  { id: 'readme',   label: 'README.txt', caption: '游戏说明',       icon: 'text',     window: 'readme' },
]

const windowDefaults = {
  battle:       { title: '微软大战代码 - 启动器',   icon: 'battle',       width: 570, top: 80,  left: 200 },
  computer:     { title: '我的电脑',               icon: 'computer',     width: 520, top: 120, left: 280 },
  recycle:      { title: '回收站',                 icon: 'recycle',      width: 400, top: 180, left: 250 },
  readme:       { title: 'README.txt - 记事本',    icon: 'text',         width: 520, top: 100, left: 320 },
  mydocs:       { title: '我的文档',               icon: 'mydocs',       width: 500, top: 110, left: 300 },
  controlpanel: { title: '控制面板',               icon: 'controlpanel', width: 520, top: 130, left: 310 },
  search:       { title: '搜索结果',               icon: 'search',       width: 420, top: 140, left: 290 },
  run:          { title: '运行',                   icon: 'run',          width: 360, top: 200, left: 320 },
}


/* === ICON COMPONENT === */
function Icon({ name, size = 32 }) {
  if (name === 'start')    return <img className="start-logo" src="/assets/xp-start-here.png" alt="" aria-hidden="true" />
  if (name === 'close')    return <svg width={size} height={size} viewBox="0 0 9 9" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5M7.5 1.5L1.5 7.5" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
  if (name === 'minimize') return <svg width={size} height={size} viewBox="0 0 9 9" aria-hidden="true"><rect x="1" y="6.5" width="7" height="1.5" fill="currentColor"/></svg>
  if (name === 'maximize') return <svg width={size} height={size} viewBox="0 0 9 9" aria-hidden="true"><rect x="1.5" y="1.5" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
  if (name === 'sound')    return <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 5v6h3l4 4V1L5 5H2zm10 1a3 3 0 0 0 0 6V6z"/></svg>
  if (name === 'battle')   return <BattleSVG size={size} />
  const src = ICON_PATHS[name]
  if (src) return <img className="xp-icon" src={src} width={size} height={size} alt="" aria-hidden="true" />
  return null
}

function BattleSVG({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs><linearGradient id="bgl" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".45"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient></defs>
      <rect x="3" y="2" width="26" height="20" rx="2" fill="#c8c8c8" stroke="#606060" strokeWidth=".8"/>
      <rect x="4" y="3" width="24" height="18" rx="1" fill="#101418"/>
      <rect x="4" y="3" width="24" height="5" fill="url(#bgl)"/>
      <text x="6" y="12" fontFamily="monospace" fontSize="4.5" fill="#00cc44" letterSpacing=".3">C:\&gt;_</text>
      <text x="6" y="17" fontFamily="monospace" fontSize="3.5" fill="#009933" opacity=".8">battle.exe</text>
      <rect x="14" y="22" width="4" height="3" fill="#a0a0a0"/>
      <rect x="10" y="25" width="12" height="3" rx="1" fill="#b8b8b8" stroke="#787878" strokeWidth=".5"/>
      <line x1="3" y1="3" x2="29" y2="3" stroke="rgba(255,255,255,.6)" strokeWidth=".7"/>
      <line x1="3" y1="3" x2="3" y2="22" stroke="rgba(255,255,255,.4)" strokeWidth=".7"/>
    </svg>
  )
}


/* === DESKTOP ICON === */
function DesktopIcon({ item, selected, onSelect, onOpen }) {
  const clickTimer = useRef(null)
  const handleClick = (e) => {
    e.stopPropagation()
    onSelect(item.id)
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
      onOpen(item.window)
      return
    }
    clickTimer.current = setTimeout(() => { clickTimer.current = null }, 280)
  }
  return (
    <button className={`desktop-icon${selected ? ' is-selected' : ''}`}
      onClick={handleClick} onDoubleClick={() => onOpen(item.window)}
      title={`打开 ${item.label}`}>
      <span className="desktop-icon-art"><Icon name={item.icon} size={32} /></span>
      <span className="desktop-icon-label">{item.label}</span>
    </button>
  )
}

/* === WINDOW FRAME === */
function WindowFrame({ id, config, children, active, minimized, maximized,
  onFocus, onMinimize, onMaximize, onClose, onDragStart, hasMenuBar, statusText }) {
  if (minimized) return null
  const style = maximized ? undefined : { width: `${config.width}px`, top: `${config.top}px`, left: `${config.left}px` }
  return (
    <section
      className={`xp-window${active ? ' is-active' : ''}${maximized ? ' is-maximized' : ''}`}
      style={style}
      onMouseDown={() => onFocus(id)}
      onContextMenu={(e) => e.stopPropagation()}>
      <header className="window-titlebar" onPointerDown={(e) => onDragStart(e, id)}>
        <span className="window-title">
          <Icon name={config.icon} size={16} />
          {config.title}
        </span>
        <span className="window-actions" onPointerDown={(e) => e.stopPropagation()}>
          <button aria-label="最小化" onClick={(e) => { e.stopPropagation(); onMinimize(id) }}><Icon name="minimize" size={9} /></button>
          <button aria-label={maximized ? '还原' : '最大化'} onClick={(e) => { e.stopPropagation(); onMaximize(id) }}><Icon name="maximize" size={9} /></button>
          <button className="window-close" aria-label="关闭" onClick={(e) => { e.stopPropagation(); onClose(id) }}><Icon name="close" size={9} /></button>
        </span>
      </header>
      {hasMenuBar && (
        <nav className="window-menubar">
          <button>文件(F)</button><button>编辑(E)</button><button>查看(V)</button><button>帮助(H)</button>
        </nav>
      )}
      {children}
      {statusText && <div className="window-statusbar">{statusText}</div>}
    </section>
  )
}


/* === BOOT SCREEN (built, not wired — set ENABLE_BOOT_SCREEN=true to activate) === */
function BootScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="boot-screen" onClick={onDone}>
      <img className="boot-logo" src="/assets/xp-start-here.png" alt="Windows XP" />
      <div>
        <div className="boot-title">Microsoft&nbsp;&nbsp;Windows&nbsp;&nbsp;XP</div>
        <div className="boot-edition">Professional</div>
      </div>
      <div className="boot-bar-wrap">
        <div className="boot-bar-track">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="boot-seg" />)}
        </div>
      </div>
    </div>
  )
}

/* === CONTEXT MENU === */
function ContextMenu({ x, y, onClose, onRefresh }) {
  return (
    <div className="context-menu" style={{ left: x, top: y }} onClick={onClose}>
      <button onClick={onRefresh}>刷新</button>
      <button disabled>排列图标(I) ▶</button>
      <div className="cm-sep" />
      <button disabled>新建文件夹(W)</button>
      <div className="cm-sep" />
      <button disabled>属性(R)</button>
    </div>
  )
}

/* === SHUTDOWN DIALOG === */
function ShutdownDialog({ onClose }) {
  const [powerOff, setPowerOff] = useState(false)
  if (powerOff) return <div className="poweroff-screen">您可以安全地关闭计算机了。</div>
  return (
    <div className="shutdown-overlay" onClick={onClose}>
      <div className="shutdown-dialog" onClick={(e) => e.stopPropagation()}>
        <header className="window-titlebar" style={{ borderRadius: '5px 5px 0 0' }}>
          <span className="window-title"><Icon name="run" size={16} />关闭 Windows</span>
          <span className="window-actions"><button className="window-close" onClick={onClose}><Icon name="close" size={9} /></button></span>
        </header>
        <div className="shutdown-body">
          <p>希望计算机做什么？</p>
          <div className="shutdown-buttons">
            <button className="xp-button" disabled>待机(S)</button>
            <button className="xp-button" onClick={() => setPowerOff(true)}>关闭(U)</button>
            <button className="xp-button" onClick={() => window.location.reload()}>重新启动(R)</button>
            <button className="xp-button primary-button" onClick={onClose}>取消</button>
          </div>
        </div>
      </div>
    </div>
  )
}


/* === START MENU === */
function StartMenu({ onOpen, onShutdown, onLogout }) {
  return (
    <aside className="start-menu" aria-label="开始菜单">
      <div className="start-user">
        <div className="start-avatar">⌘</div>
        <div><strong className="start-user-name">玩家一号</strong><span className="start-user-sub">本地用户</span></div>
      </div>
      <div className="start-columns">
        <div className="start-col-left">
          <button onClick={() => onOpen('battle')}><Icon name="battle" size={32}/><span className="menu-item-main"><b>Code Battle</b><small>微软大战代码</small></span></button>
          <button onClick={() => onOpen('computer')}><Icon name="computer" size={32}/><span className="menu-item-main"><b>我的电脑</b><small>查看系统</small></span></button>
          <button onClick={() => onOpen('readme')}><Icon name="text" size={32}/><span className="menu-item-main"><b>游戏说明</b><small>README.txt</small></span></button>
        </div>
        <div className="start-col-right">
          <button onClick={() => onOpen('mydocs')}><Icon name="mydocs" size={22}/><span>我的文档</span></button>
          <button onClick={() => onOpen('computer')}><Icon name="computer" size={22}/><span>我的电脑</span></button>
          <button onClick={() => onOpen('controlpanel')}><Icon name="controlpanel" size={22}/><span>控制面板</span></button>
          <div className="sec-sep"/>
          <button onClick={() => onOpen('search')}><Icon name="search" size={22}/><span>搜索(S)</span></button>
          <button onClick={() => onOpen('run')}><Icon name="run" size={22}/><span>运行(R)</span></button>
          <div className="sec-sep"/>
          <button onClick={() => onOpen('recycle')}><Icon name="recycle" size={22}/><span>回收站</span></button>
        </div>
      </div>
      <div className="start-footer">
        <button className="all-programs" disabled>▶▶ 所有程序</button>
        <button className="logout-btn" onClick={onLogout}>注销</button>
        <button className="shutdown-btn" onClick={onShutdown}>关闭计算机</button>
      </div>
    </aside>
  )
}

/* === CONTENT: BATTLE === */
function BattleContent() {
  const [phase, setPhase] = useState('准备期')
  const [deployed, setDeployed] = useState(false)
  return (
    <div className="window-body battle-body">
      <div className="battle-hero">
        <div className="battle-brand"><span className="brand-mark"><Icon name="battle" size={40}/></span><div><strong>MICROSOFT</strong><em>VS CODE</em></div></div>
        <span className="build-number">MVP 0.1</span>
      </div>
      <div className="battle-copy"><h1>你的防线，也是攻击面。</h1><p>准备工作流，部署代码塔，守住今晚的生产环境。</p></div>
      <div className="battle-status-row"><span className="status-light"/>{phase} <i>·</i> {deployed ? '依赖链已就绪' : '等待你的第一个部署'}</div>
      <div className="battle-grid">
        <div className="battle-card"><span className="card-kicker">MISSION 01</span><strong>守住 main 分支</strong><small>难度：入门 · Windows XP 环境</small><div className="progress-line"><span style={{ width: deployed ? '66%' : '14%' }}/></div></div>
        <div className="battle-card muted-card"><span className="card-kicker">进度</span><strong>第一轮防御</strong><small>建立工作流 · 部署第一个版本</small></div>
      </div>
      <div className="window-footer-actions"><button className="xp-button primary-button" onClick={() => { setDeployed(true); setPhase('执行期') }}>▶ 开始演练</button></div>
    </div>
  )
}


/* === CONTENT: COMPUTER, RECYCLE, README === */
function ComputerContent() {
  return (
    <div className="window-body explorer-body">
      <div className="address-bar"><span>地址</span><div>我的电脑</div><button>▼</button></div>
      <div className="explorer-section"><h3>硬盘驱动器</h3>
        <div className="drive-row"><Icon name="computer" size={32}/><div><strong>本地磁盘 (C:)</strong><small>系统盘 · 128 GB 可用</small><div className="drive-meter"><i style={{width:'28%'}}/></div></div></div>
      </div>
      <div className="explorer-section"><h3>其他位置</h3>
        <div className="drive-row"><Icon name="mydocs" size={32}/><div><strong>共享文档</strong><small>网络共享文件夹</small></div></div>
      </div>
    </div>
  )
}
function RecycleContent({ onClose }) {
  return (
    <div className="window-body recycle-body">
      <div style={{fontSize:68,opacity:.7}}><Icon name="recycle" size={68}/></div>
      <strong>回收站是空的。</strong><p>被删除的技术债会在这里短暂休息。</p>
      <button className="xp-button" onClick={onClose}>关闭</button>
    </div>
  )
}
function ReadmeContent() {
  const [openMenu, setOpenMenu] = useState(null)

  const menus = {
    file: [
      { label: '新建(N)', shortcut: 'Ctrl+N', action: () => {} },
      { label: '打开(O)...', shortcut: 'Ctrl+O', action: () => {} },
      { label: '保存(S)', shortcut: 'Ctrl+S', action: () => {} },
      { label: '另存为(A)...', action: () => {} },
      { type: 'separator' },
      { label: '页面设置(U)...', action: () => {} },
      { label: '打印(P)...', shortcut: 'Ctrl+P', action: () => {} },
      { type: 'separator' },
      { label: '退出(X)', action: () => {} },
    ],
    edit: [
      { label: '撤销(U)', shortcut: 'Ctrl+Z', action: () => {}, disabled: true },
      { type: 'separator' },
      { label: '剪切(T)', shortcut: 'Ctrl+X', action: () => {}, disabled: true },
      { label: '复制(C)', shortcut: 'Ctrl+C', action: () => {}, disabled: true },
      { label: '粘贴(P)', shortcut: 'Ctrl+V', action: () => {} },
      { label: '删除(L)', shortcut: 'Del', action: () => {}, disabled: true },
      { type: 'separator' },
      { label: '查找(F)...', shortcut: 'Ctrl+F', action: () => {} },
      { label: '查找下一个(N)', shortcut: 'F3', action: () => {}, disabled: true },
      { label: '替换(R)...', shortcut: 'Ctrl+H', action: () => {} },
      { label: '转到(G)...', shortcut: 'Ctrl+G', action: () => {} },
      { type: 'separator' },
      { label: '全选(A)', shortcut: 'Ctrl+A', action: () => {} },
      { label: '时间/日期(D)', shortcut: 'F5', action: () => {} },
    ],
    format: [
      { label: '自动换行(W)', action: () => {} },
      { label: '字体(F)...', action: () => {} },
    ],
    view: [
      { label: '状态栏(S)', action: () => {} },
    ],
    help: [
      { label: '帮助主题(H)', action: () => {} },
      { type: 'separator' },
      { label: '关于记事本(A)', action: () => {} },
    ],
  }

  return (
    <div className="notepad-body" onClick={() => setOpenMenu(null)}>
      <div className="notepad-menubar">
        <button
          className={`menu-item ${openMenu === 'file' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'file' ? null : 'file') }}
        >
          文件(F)
        </button>
        <button
          className={`menu-item ${openMenu === 'edit' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'edit' ? null : 'edit') }}
        >
          编辑(E)
        </button>
        <button
          className={`menu-item ${openMenu === 'format' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'format' ? null : 'format') }}
        >
          格式(O)
        </button>
        <button
          className={`menu-item ${openMenu === 'view' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'view' ? null : 'view') }}
        >
          查看(V)
        </button>
        <button
          className={`menu-item ${openMenu === 'help' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'help' ? null : 'help') }}
        >
          帮助(H)
        </button>

        {openMenu && (
          <div className="dropdown-menu" style={{ left: openMenu === 'file' ? 0 : openMenu === 'edit' ? 47 : openMenu === 'format' ? 94 : openMenu === 'view' ? 141 : 188 }} onClick={(e) => e.stopPropagation()}>
            {menus[openMenu].map((item, i) =>
              item.type === 'separator' ? (
                <div key={i} className="menu-separator" />
              ) : (
                <button
                  key={i}
                  className={`dropdown-item ${item.disabled ? 'disabled' : ''}`}
                  onClick={() => { if (!item.disabled) { item.action(); setOpenMenu(null) } }}
                  disabled={item.disabled}
                >
                  <span>{item.label}</span>
                  {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
                </button>
              )
            )}
          </div>
        )}
      </div>
      <pre>{`微软大战代码 / MVP 0.1\n${'='.repeat(20)}\n\n双击 Code Battle 开始第一个任务。\n\n核心规则：\n防御与漏洞，是同一种东西。\n\n[状态]\n准备期：规划你的防御链\n执行期：面对环境事件\n回溯：用时间换空间\n`}</pre>
    </div>
  )
}

/* === CONTENT: MY DOCS === */
function MyDocsContent({ onOpen }) {
  const files = [
    { name: '战役存档.dat', size: '4 KB', icon: 'folder' },
    { name: '阵型截图.bmp', size: '128 KB', icon: 'folder' },
    { name: 'README.txt',  size: '2 KB',   icon: 'text' },
  ]
  return (
    <div className="window-body mydocs-body">
      <ul className="file-list">
        {files.map(f => (
          <li key={f.name}><div className="file-row" onDoubleClick={() => f.name.includes('README') && onOpen('readme')}>
            <Icon name={f.icon} size={16}/><span className="file-name">{f.name}</span><span className="file-size">{f.size}</span>
          </div></li>
        ))}
      </ul>
    </div>
  )
}


/* === CONTENT: CONTROL PANEL, SEARCH, RUN === */
function ControlPanelContent({ muted, setMuted }) {
  return (
    <div className="window-body cp-body">
      <div className="cp-grid">
        <div className="cp-item"><Icon name="volume" size={32}/>
          <div><div className="cp-item-label">声音</div><div className="cp-item-desc">音频设备和音量</div>
            <div className="cp-toggle"><input type="checkbox" id="mute" checked={muted} onChange={e => setMuted(e.target.checked)}/><label htmlFor="mute">静音</label></div>
          </div>
        </div>
        <div className="cp-item"><Icon name="computer" size={32}/>
          <div><div className="cp-item-label">显示</div><div className="cp-item-desc">壁纸：Bliss.jpg</div></div>
        </div>
        <div className="cp-item"><Icon name="ie" size={32}/>
          <div><div className="cp-item-label">Internet 选项</div><div className="cp-item-desc">网络和拨号连接</div></div>
        </div>
      </div>
    </div>
  )
}

function SearchContent({ openWindows, desktopItems: items }) {
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    if (!q.trim()) return []
    const lq = q.toLowerCase()
    return items.filter(i => i.label.toLowerCase().includes(lq) || i.caption.toLowerCase().includes(lq))
  }, [q, items])
  return (
    <div className="window-body search-body">
      <div className="search-input-row">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="输入搜索词..." autoFocus/>
        <button className="xp-button">搜索</button>
      </div>
      <div className="search-results">
        {!q.trim() ? <div className="search-empty">输入关键词开始搜索桌面项目</div>
          : results.length === 0 ? <div className="search-empty">未找到"{q}"</div>
          : results.map(r => (
            <div key={r.id} className="search-result-row"><Icon name={r.icon} size={16}/>{r.label} — {r.caption}</div>
          ))}
      </div>
    </div>
  )
}

function RunContent({ onOpen, onClose, showToast }) {
  const [cmd, setCmd] = useState('')
  const handleRun = () => {
    const c = cmd.trim().toLowerCase()
    const map = { notepad: 'readme', explorer: 'computer', battle: 'battle',
                  computer: 'computer', recycle: 'recycle', search: 'search' }
    if (map[c]) { onOpen(map[c]); onClose() }
    else { showToast(`Windows 找不到"${cmd}"。请检查名称是否正确。`); onClose() }
  }
  return (
    <div className="window-body run-body">
      <p>请键入程序、文件夹、文档或 Internet 资源的名称，Windows 将为您打开它。</p>
      <div className="run-input-row">
        <label htmlFor="runcmd">打开(O):</label>
        <input id="runcmd" value={cmd} onChange={e => setCmd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRun()} autoFocus/>
      </div>
      <div className="window-footer-actions" style={{justifyContent:'flex-end'}}>
        <button className="xp-button primary-button" onClick={handleRun}>确定</button>
        <button className="xp-button" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}


/* === APP === */
function App() {
  const [selectedIcon, setSelectedIcon] = useState('battle')
  const [startOpen, setStartOpen] = useState(false)
  const [openWindows, setOpenWindows] = useState({})
  const [activeWindow, setActiveWindow] = useState(null)
  const [maximized, setMaximized] = useState({})
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(new Date())
  const [contextMenu, setContextMenu] = useState(null)
  const [shutdownOpen, setShutdownOpen] = useState(false)
  const [booted] = useState(!ENABLE_BOOT_SCREEN)
  const [muted, setMuted] = useState(false)
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [volume, setVolume] = useState(50)
  const dragState = useRef(null)

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => {
    const move = (e) => {
      if (!dragState.current || maximized[dragState.current.id]) return
      const { id, offsetX, offsetY } = dragState.current
      setOpenWindows(cur => ({ ...cur, [id]: { ...cur[id], left: Math.max(8, e.clientX - offsetX), top: Math.max(8, e.clientY - offsetY) } }))
    }
    const stop = () => { dragState.current = null }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop) }
  }, [maximized])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 3500); return () => clearTimeout(t) }, [toast])
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('scroll', close); window.addEventListener('resize', close)
    return () => { window.removeEventListener('scroll', close); window.removeEventListener('resize', close) }
  }, [contextMenu])

  const openWindow = useCallback((id) => {
    setOpenWindows(cur => ({ ...cur, [id]: cur[id] ? { ...cur[id], minimized: false } : { ...windowDefaults[id] } }))
    setActiveWindow(id); setStartOpen(false)
    setSelectedIcon(desktopItems.find(i => i.window === id)?.id ?? selectedIcon)
  }, [selectedIcon])

  const closeWindow = (id) => { setOpenWindows(cur => { const n = { ...cur }; delete n[id]; return n }); setActiveWindow(cur => cur === id ? null : cur) }
  const minimizeWindow = (id) => setOpenWindows(cur => ({ ...cur, [id]: { ...cur[id], minimized: true } }))
  const restoreWindow = (id) => { setOpenWindows(cur => ({ ...cur, [id]: { ...cur[id], minimized: false } })); setActiveWindow(id) }
  const toggleTaskbarWindow = (id, cfg) => { if (cfg.minimized) restoreWindow(id); else if (activeWindow === id) minimizeWindow(id); else setActiveWindow(id) }
  const toggleMaximize = (id) => setMaximized(cur => ({ ...cur, [id]: !cur[id] }))
  const dragStart = (e, id) => {
    if (e.button !== 0 || maximized[id]) return
    const rect = e.currentTarget.parentElement.getBoundingClientRect()
    dragState.current = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top }
    setActiveWindow(id)
  }
  const showDesktop = () => setOpenWindows(cur => { const n = {}; Object.keys(cur).forEach(id => { n[id] = { ...cur[id], minimized: true } }); return n })

  const handleDesktopContextMenu = (e) => {
    e.preventDefault()
    const x = Math.min(e.clientX, window.innerWidth - 175)
    const y = Math.min(e.clientY, window.innerHeight - 150)
    setContextMenu({ x, y })
  }

  const taskbarWindows = useMemo(() => Object.entries(openWindows), [openWindows])
  const timeLabel = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })

  if (ENABLE_BOOT_SCREEN && !booted) return <BootScreen onDone={() => {}} />

  return (
    <main className="desktop-shell"
      onClick={() => { setStartOpen(false); setSelectedIcon(null); setContextMenu(null); setVolumeOpen(false) }}
      onContextMenu={handleDesktopContextMenu}>

      {/* Desktop icons */}
      <div className="desktop-icons" onClick={e => e.stopPropagation()}>
        {desktopItems.map(item => (
          <DesktopIcon key={item.id} item={item} selected={selectedIcon === item.id}
            onSelect={setSelectedIcon} onOpen={openWindow} />
        ))}
      </div>

      {/* Windows */}
      {Object.entries(openWindows).map(([id, cfg]) => (
        <WindowFrame key={id} id={id} config={cfg} active={activeWindow === id}
          minimized={cfg.minimized} maximized={maximized[id]}
          onFocus={setActiveWindow} onMinimize={minimizeWindow}
          onMaximize={toggleMaximize} onClose={closeWindow} onDragStart={dragStart}
          hasMenuBar={['computer','mydocs','controlpanel'].includes(id)}
          statusText={id === 'computer' ? '1 个对象' : id === 'mydocs' ? '3 个对象' : undefined}>

          {id === 'battle'       && <BattleContent />}
          {id === 'computer'     && <ComputerContent />}
          {id === 'recycle'      && <RecycleContent onClose={() => closeWindow(id)} />}
          {id === 'readme'       && <ReadmeContent />}
          {id === 'mydocs'       && <MyDocsContent onOpen={openWindow} />}
          {id === 'controlpanel' && <ControlPanelContent muted={muted} setMuted={setMuted} />}
          {id === 'search'       && <SearchContent openWindows={openWindows} desktopItems={desktopItems} />}
          {id === 'run'          && <RunContent onOpen={openWindow} onClose={() => closeWindow(id)} showToast={setToast} />}
        </WindowFrame>
      ))}

      {/* Start menu */}
      {startOpen && <StartMenu onOpen={openWindow}
        onShutdown={() => { setStartOpen(false); setShutdownOpen(true) }}
        onLogout={() => { setStartOpen(false); setToast('已注销。返回到 Windows 登录界面。') }} />}

      {/* Toast */}
      {toast && <div className="toast"><span className="toast-led"/>{toast}</div>}

      {/* Context menu */}
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y}
        onClose={() => setContextMenu(null)} onRefresh={() => setContextMenu(null)} />}

      {/* Shutdown dialog */}
      {shutdownOpen && <ShutdownDialog onClose={() => setShutdownOpen(false)} />}

      {/* Taskbar */}
      <footer className="taskbar" onClick={e => e.stopPropagation()}>
        <button className={`start-button${startOpen ? ' is-pressed' : ''}`}
          onClick={() => setStartOpen(cur => !cur)}>
          <Icon name="start" size={23} /><strong>开始</strong>
        </button>

        {/* Quick launch */}
        <div className="quick-launch">
          <div className="ql-sep"/>
          <button className="ql-btn" title="显示桌面" onClick={showDesktop}>
            <img className="xp-icon" src="/assets/xp/GenericTextDocument.png" width={16} height={16} alt=""/>
          </button>
          <button className="ql-btn" title="Internet Explorer" onClick={() => openWindow('computer')}>
            <Icon name="ie" size={16}/>
          </button>
          <div className="ql-sep"/>
        </div>

        {/* Window list */}
        <div className="taskbar-window-list">
          {taskbarWindows.map(([id, cfg]) => (
            <button key={id} className={`taskbar-window${activeWindow === id && !cfg.minimized ? ' is-active' : ''}`}
              onClick={() => toggleTaskbarWindow(id, cfg)}>
              <Icon name={cfg.icon} size={16}/><span>{cfg.title}</span>
            </button>
          ))}
        </div>

        {/* System tray */}
        <div className="system-tray">
          <span className="tray-overflow" title="隐藏图标"><i/></span>
          <button className="tray-sound" onClick={(e) => { e.stopPropagation(); setVolumeOpen(cur => !cur) }} title="音量">
            <Icon name="sound" size={16}/>
          </button>
          <span className="tray-time"><b>{timeLabel}</b></span>
        </div>
      </footer>

      {/* Volume control panel */}
      {volumeOpen && (
        <div className="volume-popup" onClick={(e) => e.stopPropagation()}>
          <div className="volume-popup-header">音量</div>
          <div className="volume-popup-body">
            <input
              type="range"
              className="volume-slider-vertical"
              orient="vertical"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                setVolume(Number(e.target.value))
                setMuted(false)
              }}
              aria-label="音量"
            />
            <div className="volume-mute-check">
              <input
                type="checkbox"
                id="volume-mute"
                checked={muted}
                onChange={(e) => setMuted(e.target.checked)}
              />
              <label htmlFor="volume-mute">静音</label>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)









