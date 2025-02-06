import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Edit2, Menu, List, X } from "lucide-react"
import { GooeyFilter } from "./gooey-filter"
import { useRouter } from "next/navigation"

const MENU_ITEMS = [
  { icon: Edit2, label: "Edit List", href: "/edit" },
  { icon: List, label: "My Lists", href: "/my-lists" },
]

interface MenuButtonProps {
  groupId: string;
}

export function MenuButton({ groupId }: MenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="relative">
      <GooeyFilter id="gooey-filter-menu" strength={5} />

      <div
        className="fixed bottom-4 left-4 z-50"
        style={{ filter: "url(#gooey-filter-menu)" }}
      >
        {/* Menu Items */}
        <AnimatePresence>
          {isOpen &&
            MENU_ITEMS.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.label}
                  className="absolute w-auto min-w-[160px] h-12 bg-white dark:bg-gray-800 rounded-full flex items-center gap-3 px-4 shadow-lg"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{
                    y: -((index + 1) * 44),
                    opacity: 1,
                  }}
                  exit={{
                    y: 0,
                    opacity: 0,
                    transition: {
                      delay: (MENU_ITEMS.length - index) * 0.05,
                      duration: 0.4,
                      type: "spring",
                      bounce: 0,
                    },
                  }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.4,
                    type: "spring",
                    bounce: 0,
                  }}
                  onClick={() => {
                    setIsOpen(false)
                    if (item.href === '/edit') {
                      router.push(`/edit/${groupId}`)
                    } else {
                      router.push(item.href)
                    }
                  }}
                >
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {item.label}
                  </span>
                </motion.button>
              )
            })}
        </AnimatePresence>

        {/* Main Menu Button */}
        <motion.button
          className="relative w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
} 