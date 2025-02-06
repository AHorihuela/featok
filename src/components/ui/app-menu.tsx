'use client';

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { GooeyFilter } from "./gooey-filter"
import { useRouter, usePathname } from "next/navigation"

interface MenuItem {
  icon: string;
  label: string;
  href: string;
}

interface AppMenuProps {
  groupId?: string;
}

export function AppMenu({ groupId }: AppMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (!groupId) return;

      try {
        const creatorId = localStorage.getItem('featok_creator_id');
        if (!creatorId) return;

        const response = await fetch(`/api/ideas/group/${groupId}`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.ideas?.[0]?.creatorId === creatorId) {
          setIsCreator(true);
        }
      } catch (error) {
        console.error('Failed to check creator status:', error);
      }
    };

    checkCreatorStatus();
  }, [groupId]);

  // Define menu items based on current page and creator status
  const getMenuItems = (): MenuItem[] => {
    // If we're on a voting page and user is the creator
    if (pathname.startsWith('/swipe/') && isCreator) {
      return [
        { icon: "✏️", label: "Edit List", href: `/edit/${groupId}` },
        { icon: "📋", label: "My Lists", href: "/my-lists" },
      ];
    }
    
    // If we're on the edit page
    if (pathname.startsWith('/edit/')) {
      return [
        { icon: "👀", label: "View List", href: `/swipe/${groupId}` },
        { icon: "📋", label: "My Lists", href: "/my-lists" },
      ];
    }
    
    // If we're on the my-lists page
    if (pathname === '/my-lists') {
      return [
        { icon: "➕", label: "New List", href: "/" },
      ];
    }

    // If we're on the homepage
    if (pathname === '/') {
      return [
        { icon: "📋", label: "My Lists", href: "/my-lists" },
      ];
    }

    // Default - show nothing if user isn't a creator or on a relevant page
    return [];
  };

  const menuItems = getMenuItems();

  // Don't render anything if there are no menu items
  if (menuItems.length === 0) {
    return null;
  }

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
            menuItems.map((item, index) => {
              return (
                <motion.button
                  key={item.label}
                  className="absolute w-auto min-w-[180px] h-14 bg-gradient-to-r from-white to-gray-50 rounded-2xl flex items-center gap-3 px-6 shadow-lg border border-gray-100"
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
                      delay: (menuItems.length - index) * 0.05,
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
                    setIsOpen(false);
                    router.push(item.href);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-700 font-medium">
                    {item.label}
                  </span>
                </motion.button>
              )
            })}
        </AnimatePresence>

        {/* Main Menu Button */}
        <motion.button
          className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group hover:shadow-blue-500/25"
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
  );
} 