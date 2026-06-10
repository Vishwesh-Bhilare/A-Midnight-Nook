import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, CalendarDays, Check, ChevronLeft, Download, Flame, Headphones, Heart, LockKeyhole, Music2, NotebookPen, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import booksData from './data/books.json'

type Book = typeof booksData[number]
type View = 'room' | 'calendar' | 'journal'

const storageKey = 'midnight-nook-progress'

function loadOpened(): number[] {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]') } catch { return [] }
}

function BookCover({ book, small = false }: { book: Book; small?: boolean }) {
  return <div className={`book-cover ${small ? 'book-cover--small' : ''}`} style={{ '--cover': book.cover, '--accent': book.accent } as CSSProperties}>
    <span className="cover-flourish">✦</span><span className="cover-title">{book.title}</span><span className="cover-author">{book.author}</span>
  </div>
}

function Rain() {
  return <div className="rain" aria-hidden="true">{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ left: `${(i * 29) % 100}%`, animationDelay: `${(i % 9) * -.21}s`, animationDuration: `${.7 + (i % 5) * .12}s` }} />)}</div>
}

function availableDayFor(date = new Date()) {
  const start = new Date('2026-12-01T00:00:00')
  const end = new Date('2026-12-24T23:59:59')
  if (date < start) return 1
  if (date > end) return 24
  return Math.min(date.getDate(), 24)
}

function Room({ opened, onSelect, onFinal, stage }: { opened: number[]; onSelect: (book: Book) => void; onFinal: () => void; stage: number }) {
  const spots = [
    [17, 56], [12, 31], [31, 72], [78, 65], [67, 48], [87, 37], [6, 69], [45, 79], [91, 72], [23, 43], [57, 28], [73, 78],
    [9, 46], [39, 37], [84, 54], [50, 61], [94, 47], [26, 83], [63, 73], [14, 78], [36, 56], [81, 81], [54, 84], [70, 59]
  ]
  const availableDay = availableDayFor()
  return <div className={`room stage-${stage}`}>
    <div className="ceiling-beam" />
    <div className="garland garland-one">{Array.from({length: 13},(_,i)=><i key={i}/>)}</div>
    <div className="garland garland-two">{Array.from({length: 9},(_,i)=><i key={i}/>)}</div>
    <div className="left-wall-art"><div className="moon-art">☾</div><div className="tiny-frame">❧</div></div>
    <div className="window">
      <div className="window-sky"><span className="moon"/><span className="cloud c1"/><span className="cloud c2"/><div className="rooftops"/><Rain/></div>
      <div className="window-cross v"/><div className="window-cross h"/>
      <div className="window-seat"><span className="pillow p1"/><span className="pillow p2"/><span className="seat-book"/></div>
    </div>
    <div className="shelf shelf-left">
      <div className="shelf-top">MIDNIGHT<br/>READING NOOK</div>
      {[0,1,2,3].map(row=><div className="shelf-row" key={row}>{Array.from({length: 9},(_,i)=><i key={i} style={{height:`${35 + ((i*17+row*11)%27)}%`, background:['#7b3c31','#b87946','#44584c','#745846','#bc975c','#354c58'][(i+row)%6]}}/>)}</div>)}
    </div>
    <div className="shelf shelf-right">
      <div className="shelf-label">MEMORIES</div>
      {[0,1,2].map(row=><div className="shelf-row memory-row" key={row}>{opened.slice(row*6,row*6+6).map(day=><i key={day} className="memory-book" style={{background:booksData[day-1].cover}} title={booksData[day-1].title}/>)}</div>)}
      <div className="cabinet"><i/><i/></div>
    </div>
    <button className="fireplace" aria-label={opened.length === 24 ? "Open the final letter" : "Fireplace—the final secret is still sleeping"} onClick={()=>opened.length === 24 && onFinal()}><div className="mantle"><span className="candle"/><span className="mantle-clock">◷</span><span className="candle short"/></div><div className="firebox"><div className="logs"/><div className="fire"><i/><i/><i/></div></div></button>
    <div className="rug"><span/><span/><span/></div>
    <div className="armchair"><div className="chair-back"/><div className="chair-seat"/><div className="chair-arm left"/><div className="chair-arm right"/><div className="blanket"/></div>
    <div className="side-table"><div className="lamp"><span className="lamp-glow"/><span className="shade"/><span className="stem"/></div><div className="teacup"><i/><span className="steam s1"/><span className="steam s2"/></div></div>
    <div className="desk"><div className="desk-lamp"><span/><i/></div><div className="journal-prop">quiet<br/>thoughts</div><div className="desk-drawers"><i/><i/><i/></div></div>
    <div className="cat"><span className="cat-tail"/><span className="cat-body"/><span className="cat-head"><i/><b/></span></div>
    <div className="couple" aria-label="Two friends reading together"><div className="person boy"><span className="hair"/><span className="face"><i className="glasses"/></span><span className="body"/><span className="book-held"/></div><div className="person girl"><span className="hair"/><span className="face"/><span className="body"/></div></div>
    <div className="dust">{Array.from({length:18},(_,i)=><i key={i} style={{left:`${35+(i*23)%48}%`,top:`${18+(i*31)%62}%`,animationDelay:`${-i*.4}s`}}/>)}</div>
    {booksData.map((book, i) => {
      const unlocked = book.day <= availableDay
      const isOpened = opened.includes(book.day)
      return <button key={book.day} className={`day-spot ${unlocked ? 'unlocked' : 'locked'} ${isOpened ? 'opened' : ''}`} style={{left:`${spots[i][0]}%`,top:`${spots[i][1]}%`}} onClick={()=>unlocked && onSelect(book)} aria-label={unlocked ? `Open day ${book.day}: ${book.title}` : `Day ${book.day}, locked`}>
        <span className="spot-number">{book.day}</span>{unlocked ? <Sparkles size={12}/> : <LockKeyhole size={10}/>}<span className="spot-tooltip">{unlocked ? (isOpened ? 'Visit again' : "Tonight's story") : `Opens Dec ${book.day}`}</span>
      </button>
    })}
  </div>
}

function Reveal({ book, isOpened, onClose, onOpened }: { book: Book; isOpened: boolean; onClose:()=>void; onOpened:()=>void }) {
  const [unwrapped, setUnwrapped] = useState(isOpened)
  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <motion.section className="reveal-card" initial={{scale:.86,y:45,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:.9,opacity:0}} transition={{type:'spring',damping:22}}>
      <button className="close-button" onClick={onClose}><X size={18}/></button>
      {!unwrapped ? <div className="wrapped-view">
        <p className="eyebrow">December {book.day} · waiting for you</p><div className="gift" onClick={()=>setUnwrapped(true)}><div className="gift-paper">✦<span className="ribbon-v"/><span className="ribbon-h"/><i className="bow b1"/><i className="bow b2"/></div></div>
        <h2>A story, wrapped in starlight.</h2><p>Tap the parcel to open tonight’s book.</p>
      </div> : <motion.div className="book-reveal" initial={{opacity:0}} animate={{opacity:1}}>
        <div className="reveal-left"><p className="eyebrow">Tonight’s story · Day {book.day}</p><BookCover book={book}/><p className="hand-note">“{book.note}”</p></div>
        <div className="reveal-info"><span className="little-star">✦</span><h2>{book.title}</h2><p className="author">by {book.author}</p><div className="rule"/><dl><div><dt>Genre</dt><dd>{book.genre}</dd></div><div><dt>Reading time</dt><dd>{book.length}</dd></div></dl><div className="tags">{book.mood.map(tag=><span key={tag}>{tag}</span>)}</div>
          <div className="actions"><button className="primary-action"><BookOpen size={17}/> Read online</button><button className="secondary-action"><Download size={16}/> PDF</button></div>
          <button className={`mark-button ${isOpened?'done':''}`} onClick={onOpened}>{isOpened?<><Check size={16}/> Resting on your memory shelf</>:<>Mark as opened <span>→</span></>}</button>
          <p className="content-note">Add your licensed reading links and files in the book data when you’re ready.</p>
        </div>
      </motion.div>}
    </motion.section>
  </motion.div>
}

function CalendarView({ opened, onSelect }: { opened:number[]; onSelect:(b:Book)=>void }) {
  const availableDay = availableDayFor()
  return <motion.main className="page-view" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}><div className="page-heading"><p className="eyebrow">Twenty-four evenings together</p><h1>Your December stories</h1><p>Every night, another spine finds its place in the nook.</p></div><div className="calendar-grid">{booksData.map(book=><button key={book.day} className={`calendar-book ${book.day<=availableDay?'available':'locked'} ${opened.includes(book.day)?'complete':''}`} onClick={()=>book.day<=availableDay&&onSelect(book)}><BookCover book={book} small/><span className="calendar-day">{String(book.day).padStart(2,'0')}</span>{book.day>availableDay&&<LockKeyhole size={13}/>} {opened.includes(book.day)&&<Check size={14}/>}</button>)}</div></motion.main>
}

function Journal({ opened }: { opened:number[] }) {
  return <motion.main className="page-view journal-view" initial={{opacity:0}} animate={{opacity:1}}><div className="journal-book"><div className="journal-page left-page"><p className="script">The Reading Journal</p><h2>A little record of<br/>our winter evenings</h2><div className="journal-stats"><div><strong>{opened.length}</strong><span>stories opened</span></div><div><strong>{opened.length ? 1 : 0}</strong><span>evening streak</span></div><div><strong>{Math.round(opened.length/24*100)}%</strong><span>of the nook filled</span></div></div><blockquote>“A room without books is like a body without a soul.”</blockquote></div><div className="journal-page right-page"><p className="eyebrow">Notes from the nook</p>{opened.length ? opened.map(day=><div className="journal-entry" key={day}><span>{day}</span><div><strong>{booksData[day-1].title}</strong><p>{booksData[day-1].mood.join(' · ')}</p></div><Heart size={15}/></div>) : <div className="empty-journal"><NotebookPen size={30}/><p>Your pages are waiting.</p><span>Open tonight’s story to begin.</span></div>}</div></div></motion.main>
}

function App() {
  const [view,setView]=useState<View>('room')
  const [opened,setOpened]=useState<number[]>(loadOpened)
  const [selected,setSelected]=useState<Book|null>(null)
  const [intro,setIntro]=useState(true)
  const [sound,setSound]=useState(false)
  const [finalLetter,setFinalLetter]=useState(false)
  useEffect(()=>{const t=setTimeout(()=>setIntro(false),3600); return()=>clearTimeout(t)},[])
  useEffect(()=>localStorage.setItem(storageKey,JSON.stringify(opened)),[opened])
  const stage=useMemo(()=>opened.length>=24?4:opened.length>=18?3:opened.length>=12?2:opened.length>=6?1:0,[opened])
  const markOpened=()=>{if(selected&&!opened.includes(selected.day))setOpened([...opened,selected.day].sort((a,b)=>a-b))}
  return <div className="app-shell">
    <AnimatePresence>{intro&&<motion.div className="intro" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:1.1}}><div className="intro-moon">☾</div><p>Welcome back.</p><p className="type-line">Tonight’s story is waiting for you.</p><button onClick={()=>setIntro(false)}>Enter the nook <span>→</span></button></motion.div>}</AnimatePresence>
    <header><button className="brand" onClick={()=>setView('room')}><span>☾</span><div><strong>The Midnight</strong><small>Reading Nook</small></div></button><nav><button className={view==='room'?'active':''} onClick={()=>setView('room')}><Flame/>The Nook</button><button className={view==='calendar'?'active':''} onClick={()=>setView('calendar')}><CalendarDays/>Calendar</button><button className={view==='journal'?'active':''} onClick={()=>setView('journal')}><NotebookPen/>Journal</button></nav><div className="header-tools"><span className="progress-pill">{opened.length} <i>/ 24 stories</i></span><button className="sound" onClick={()=>setSound(!sound)} aria-label="Toggle rain sounds">{sound?<Volume2/>:<VolumeX/>}</button></div></header>
    <AnimatePresence mode="wait">{view==='room'?<motion.main key="room" className="room-wrap" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Room opened={opened} onSelect={setSelected} onFinal={()=>setFinalLetter(true)} stage={stage}/><div className="room-caption"><span className="caption-line"/><div><p>Tuesday, December 1</p><strong>It’s warm inside. Look around—something is waiting for you.</strong></div><span className="room-hint"><Sparkles/> Glowing numbers hide tonight’s stories</span></div></motion.main>:view==='calendar'?<CalendarView key="calendar" opened={opened} onSelect={setSelected}/>:<Journal key="journal" opened={opened}/>}</AnimatePresence>
    <footer><span>Made for slow evenings &amp; good stories</span><i>✦</i><span>December 2026</span></footer>
    <AnimatePresence>{selected&&<Reveal book={selected} isOpened={opened.includes(selected.day)} onClose={()=>setSelected(null)} onOpened={markOpened}/>}</AnimatePresence>
    <AnimatePresence>{finalLetter&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.section className="final-letter" initial={{scale:.9,y:30}} animate={{scale:1,y:0}}><button className="close-button" onClick={()=>setFinalLetter(false)}><X size={18}/></button><span>☾</span><p className="script">One last letter</p><h2>Thank you for spending<br/>these evenings here.</h2><p>Every story added something to this room—and every evening made it feel a little more like home.</p><div>Here’s to the books still waiting for us.</div><small>Always, with love ✦</small></motion.section></motion.div>}</AnimatePresence>
    {sound&&<div className="sound-toast"><Headphones size={15}/> Rain ambience on <Music2 size={13}/></div>}
  </div>
}
export default App
