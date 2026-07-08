import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, CalendarDays, Check, Download, Flame, Headphones, LockKeyhole, Music2, NotebookPen, Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import booksData from './data/books.json'

type Book = typeof booksData[number]
type View = 'room' | 'calendar' | 'journal'
type Composition = 'window' | 'fireplace' | 'path'

const storageKey = 'midnight-nook-progress'
const totalDays = booksData.length
const calendarStart = new Date('2026-12-01T00:00:00')

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
  const end = new Date(`2026-12-${String(totalDays).padStart(2, '0')}T23:59:59`)
  if (date < calendarStart) return 1
  if (date > end) return totalDays
  return Math.min(date.getDate(), totalDays)
}

const compositions: Record<Composition, { label: string; hint: string; spots: [number, number][] }> = {
  window: {
    label: 'Window focus',
    hint: 'A quiet window-seat cluster keeps the books close to the main scene.',
    spots: [[34, 18], [43, 18], [52, 18], [61, 18], [31, 39], [41, 39], [51, 39], [61, 39], [69, 39], [37, 57], [46, 57], [55, 57], [64, 57]]
  },
  fireplace: {
    label: 'Hearth focus',
    hint: 'Markers gather along the mantle and hearth so the final reveal feels important.',
    spots: [[48, 55], [54, 55], [60, 55], [66, 55], [72, 55], [47, 68], [53, 68], [59, 68], [65, 68], [71, 68], [52, 80], [60, 80], [68, 80]]
  },
  path: {
    label: 'Reading path',
    hint: 'December follows a soft arc from the shelf, through the window seat, to the fire.',
    spots: [[18, 32], [23, 42], [30, 50], [38, 56], [46, 58], [54, 57], [61, 54], [66, 49], [70, 44], [73, 51], [73, 62], [68, 72], [60, 79]]
  }
}

function Room({ opened, onSelect, onFinal, stage, composition, onCompositionChange }: { opened: number[]; onSelect: (book: Book) => void; onFinal: () => void; stage: number; composition: Composition; onCompositionChange: (composition: Composition) => void }) {
  const activeComposition = compositions[composition]
  const spots = activeComposition.spots
  const availableDay = availableDayFor()
  return <div className={`room stage-${stage} composition-${composition}`}>
    <div className="composition-switcher" aria-label="Room composition options">
      {(Object.keys(compositions) as Composition[]).map(option => <button key={option} className={option === composition ? 'active' : ''} onClick={() => onCompositionChange(option)} aria-pressed={option === composition}>{compositions[option].label}</button>)}
    </div>
    <div className="first-visit-hint">Tonight’s book glows warmest. {activeComposition.hint}</div>
    <div className="ceiling-beam" />
    <div className="window">
      <div className="window-sky"><span className="moon"/><div className="rooftops"/><Rain/></div>
      <div className="window-cross v"/><div className="window-cross h"/>
      <div className="window-seat"><span className="pillow p1"/><span className="pillow p2"/><span className="seat-book"/></div>
    </div>
    <div className="shelf shelf-left">
      <div className="shelf-top">MIDNIGHT<br/>READING NOOK</div>
      {[0,1,2,3].map(row=><div className="shelf-row" key={row}>{Array.from({length: 9},(_,i)=><i key={i} style={{height:`${35 + ((i*17+row*11)%27)}%`, background:['#7b3c31','#b87946','#44584c','#745846','#bc975c','#354c58'][(i+row)%6]}}/>)}</div>)}
    </div>
    <button className="fireplace" aria-label={opened.length === totalDays ? "Open the final letter" : "Fireplace—the final letter is still sleeping"} onClick={()=>opened.length === totalDays && onFinal()}><div className="mantle"><span className="candle"/><span className="mantle-clock">◷</span><span className="candle short"/></div><div className="firebox"><div className="logs"/><div className="fire"><i/><i/><i/></div></div></button>
    <div className="rug"><span/><span/><span/></div>
    <div className="armchair"><div className="chair-back"/><div className="chair-seat"/><div className="chair-arm left"/><div className="chair-arm right"/><div className="blanket"/></div>
    <div className="side-table"><div className="lamp"><span className="lamp-glow"/><span className="shade"/><span className="stem"/></div><div className="teacup"><i/><span className="steam s1"/><span className="steam s2"/></div></div>
    <div className="desk"><div className="desk-drawers"><i/><i/><i/></div></div>
    {booksData.map((book, i) => {
      const unlocked = book.day <= availableDay
      const isOpened = opened.includes(book.day)
      return <button key={book.day} className={`day-spot ${unlocked ? 'unlocked' : 'locked'} ${isOpened ? 'opened' : ''} ${book.day === availableDay ? 'current' : ''}`} style={{left:`${spots[i][0]}%`,top:`${spots[i][1]}%`}} onClick={()=>unlocked && onSelect(book)} aria-label={unlocked ? `Open day ${book.day}: ${book.title}` : `Day ${book.day}, locked`}>
        <span className="spot-number">{book.day}</span>{!unlocked && <LockKeyhole size={10}/>}<span className="spot-tooltip">{unlocked ? (isOpened ? 'Opened' : "Open book") : `Opens Dec ${book.day}`}</span>
      </button>
    })}
  </div>
}

function Reveal({ book, isOpened, onClose, onOpened }: { book: Book; isOpened: boolean; onClose:()=>void; onOpened:()=>void }) {
  const [unwrapped, setUnwrapped] = useState(isOpened)
  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <motion.section className="reveal-card" initial={{scale:.98,y:16,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:.98,y:8,opacity:0}} transition={{duration:.22,ease:[.22,1,.36,1]}}>
      <button className="close-button" onClick={onClose}><X size={18}/></button>
      {!unwrapped ? <div className="wrapped-view">
        <p className="eyebrow">December {book.day}</p><div className="gift" onClick={()=>setUnwrapped(true)}><div className="gift-paper">✦<span className="ribbon-v"/><span className="ribbon-h"/><i className="bow b1"/><i className="bow b2"/></div></div>
        <h2>Day {book.day} book</h2><p>Tap the parcel to open it.</p>
      </div> : <motion.div className="book-reveal" initial={{opacity:0}} animate={{opacity:1}}>
        <div className="reveal-left"><p className="eyebrow">Tonight’s story · Day {book.day}</p><BookCover book={book}/><p className="hand-note">“{book.note}”</p></div>
        <div className="reveal-info"><span className="little-star">✦</span><h2>{book.title}</h2><p className="author">by {book.author}</p><div className="rule"/><dl><div><dt>Genre</dt><dd>{book.genre}</dd></div><div><dt>Reading time</dt><dd>{book.length}</dd></div></dl><div className="tags">{book.mood.map(tag=><span key={tag}>{tag}</span>)}</div>
          <div className="actions"><a className="primary-action" href={book.file} target="_blank" rel="noreferrer"><BookOpen size={17}/> Read online</a><a className="secondary-action" href={book.file} download><Download size={16}/> {book.format}</a></div>
          <button className={`mark-button ${isOpened?'done':''}`} onClick={onOpened}>{isOpened?<><Check size={16}/> Resting on your memory shelf</>:<>Mark as opened <span>→</span></>}</button>
          <p className="content-note">Tip: open the book in a new tab or download a copy for offline reading.</p>
        </div>
      </motion.div>}
    </motion.section>
  </motion.div>
}

function CalendarView({ opened, onSelect }: { opened:number[]; onSelect:(b:Book)=>void }) {
  const availableDay = availableDayFor()
  return <motion.main className="page-view" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}><div className="page-heading"><p className="eyebrow">December reading</p><h1>Your 13-day book advent</h1><p>One book for each day, December 1–13.</p></div><div className="calendar-grid">{booksData.map(book=><button key={book.day} className={`calendar-book ${book.day<=availableDay?'available':'locked'} ${opened.includes(book.day)?'complete':''}`} onClick={()=>book.day<=availableDay&&onSelect(book)}><BookCover book={book} small/><span className="calendar-day">{String(book.day).padStart(2,'0')}</span>{book.day>availableDay&&<LockKeyhole size={13}/>} {opened.includes(book.day)&&<Check size={14}/>}</button>)}</div></motion.main>
}

function Journal({ opened }: { opened:number[] }) {
  return <motion.main className="page-view journal-view" initial={{opacity:0}} animate={{opacity:1}}><div className="journal-book"><div className="journal-page left-page"><p className="script">Reading Journal</p><h2>A little record of<br/>our winter evenings</h2><div className="journal-stats"><div><strong>{opened.length}</strong><span>stories opened</span></div><div><strong>{opened.length ? 1 : 0}</strong><span>evening streak</span></div><div><strong>{Math.round(opened.length/totalDays*100)}%</strong><span>of the nook filled</span></div></div><blockquote>“A room without books is like a body without a soul.”</blockquote></div><div className="journal-page right-page"><p className="eyebrow">Notes from the nook</p>{opened.length ? opened.map(day=><div className="journal-entry" key={day}><span>{day}</span><div><strong>{booksData[day-1].title}</strong><p>{booksData[day-1].mood.join(' · ')}</p></div><Check size={15}/></div>) : <div className="empty-journal"><NotebookPen size={30}/><p>No notes yet.</p><span>Open a book to start the journal.</span></div>}</div></div></motion.main>
}

function App() {
  const [view,setView]=useState<View>('room')
  const [opened,setOpened]=useState<number[]>(loadOpened)
  const [selected,setSelected]=useState<Book|null>(null)
  const [intro,setIntro]=useState(true)
  const [sound,setSound]=useState(false)
  const [finalLetter,setFinalLetter]=useState(false)
  const [composition,setComposition]=useState<Composition>('window')
  useEffect(()=>{const t=setTimeout(()=>setIntro(false),3600); return()=>clearTimeout(t)},[])
  useEffect(()=>localStorage.setItem(storageKey,JSON.stringify(opened)),[opened])
  const stage=useMemo(()=>opened.length>=totalDays?4:opened.length>=10?3:opened.length>=7?2:opened.length>=4?1:0,[opened])
  const markOpened=()=>{if(selected&&!opened.includes(selected.day))setOpened([...opened,selected.day].sort((a,b)=>a-b))}
  return <div className="app-shell">
    <AnimatePresence>{intro&&<motion.div className="intro" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:1.1}}><p>Welcome back.</p><p className="type-line">Your December books are here.</p><button onClick={()=>setIntro(false)}>Enter the nook <span>→</span></button></motion.div>}</AnimatePresence>
    <header><button className="brand" onClick={()=>setView('room')}><div><strong>The Midnight</strong><small>Reading Nook</small></div></button><nav><button className={view==='room'?'active':''} onClick={()=>setView('room')}><Flame/>The Nook</button><button className={view==='calendar'?'active':''} onClick={()=>setView('calendar')}><CalendarDays/>Calendar</button><button className={view==='journal'?'active':''} onClick={()=>setView('journal')}><NotebookPen/>Journal</button></nav><div className="header-tools"><span className="progress-pill">{opened.length} <i>/ {totalDays} stories</i></span><button className="sound" onClick={()=>setSound(!sound)} aria-label="Toggle rain sounds">{sound?<Volume2/>:<VolumeX/>}</button></div></header>
    <AnimatePresence mode="wait">{view==='room'?<motion.main key="room" className="room-wrap" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Room opened={opened} onSelect={setSelected} onFinal={()=>setFinalLetter(true)} stage={stage} composition={composition} onCompositionChange={setComposition}/><div className="room-caption"><span className="caption-line"/><div><p>December 1–13, 2026</p><strong>Select a numbered spot to open the day’s book.</strong></div><span className="room-hint">Unlocked days are marked in brass</span></div></motion.main>:view==='calendar'?<CalendarView key="calendar" opened={opened} onSelect={setSelected}/>:<Journal key="journal" opened={opened}/>}</AnimatePresence>
    <footer><span>13 books</span><i>/</i><span>December 2026</span></footer>
    <AnimatePresence>{selected&&<Reveal book={selected} isOpened={opened.includes(selected.day)} onClose={()=>setSelected(null)} onOpened={markOpened}/>}</AnimatePresence>
    <AnimatePresence>{finalLetter&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.section className="final-letter" initial={{scale:.98,y:16,opacity:0}} animate={{scale:1,y:0,opacity:1}} transition={{duration:.22,ease:[.22,1,.36,1]}}><button className="close-button" onClick={()=>setFinalLetter(false)}><X size={18}/></button><p className="script">Final note</p><h2>Thirteen books,<br/>one shelf.</h2><p>Thank you for reading through December with me.</p><div>There is always room for one more book.</div><small>With love</small></motion.section></motion.div>}</AnimatePresence>
    {sound&&<div className="sound-toast"><Headphones size={15}/> Rain ambience on <Music2 size={13}/></div>}
  </div>
}
export default App
