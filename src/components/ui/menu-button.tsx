import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { GooeyFilter } from "./gooey-filter"
import { useRouter } from "next/navigation"

const MENU_ITEMS = [
  { icon: "✏️", label: "Edit List", href: "/edit" },
  { icon: "📋", label: "My Lists", href: "/my-lists" },
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
              return (
                <motion.button
                  key={item.label}
                  className="absolute w-auto min-w-[180px] h-14 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center gap-3 px-6 shadow-lg border border-gray-100 dark:border-gray-700"
                  initial={{ y: 0, opacity: 0, scale: 0.8 }}
                  animate={{
                    y: -((index + 1) * 60),
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    y: 0,
                    opacity: 0,
                    scale: 0.8,
                    transition: {
                      delay: (MENU_ITEMS.length - index) * 0.05,
                      duration: 0.3,
                      ease: "backIn",
                    },
                  }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.4,
                    type: "spring",
                    bounce: 0.3,
                  }}
                  onClick={() => {
                    setIsOpen(false)
                    if (item.href === '/edit') {
                      router.push(`/edit/${groupId}`)
                    } else {
                      router.push(item.href)
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {item.label}
                  </span>
                </motion.button>
              )
            })}
        </AnimatePresence>

        {/* Main Menu Button */}
        <motion.button
          className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group hover:shadow-blue-500/25"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
} 