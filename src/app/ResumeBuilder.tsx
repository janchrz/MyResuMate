'use client'

import React, { useState, useRef, useEffect } from 'react'
import { jsPDF } from "jspdf"
import "jspdf/dist/polyfills.es.js"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Download, Eye, Github, Linkedin, Facebook, Instagram, Briefcase, GraduationCap, Wrench, Folder, Award, Check, Loader2, Twitter } from 'lucide-react'
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const removeFocusBorderClass = `
  .remove-focus-border:focus {
    outline: none;
    box-shadow: none;
  }
  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  *::-webkit-scrollbar {
    display: none;
  }
`;

const removeFocusBorder = "remove-focus-border"

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState('personal')
  const [tabBounds, setTabBounds] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const tabsListRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [{ title: '', company: '', startDate: '', endDate: '', description: '', currentlyWorking: false }],
    education: [{ degree: '', institution: '', startDate: '', endDate: '', currentlyStudying: false }],
    skills: [''],
    projects: [{ name: '', description: '', links: [{ url: '', name: '' }] }],
    certifications: [{ name: '', issuer: '', startDate: '', endDate: '', description: '' }]
  })

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadComplete, setDownloadComplete] = useState(false)

  const tabs = [
    { value: 'personal', icon: <Eye className="w-4 h-4" />, label: 'Personal' },
    { value: 'experience', icon: <Briefcase className="w-4 h-4" />, label: 'Experience' },
    { value: 'education', icon: <GraduationCap className="w-4 h-4" />, label: 'Education' },
    { value: 'skills', icon: <Wrench className="w-4 h-4" />, label: 'Skills' },
    { value: 'projects', icon: <Folder className="w-4 h-4" />, label: 'Projects' },
    { value: 'certifications', icon: <Award className="w-4 h-4" />, label: 'Certifications' },
  ]

  const isMobile = useIsMobile();

  useEffect(() => {
    const activeTabElement = tabsRef.current[tabs.findIndex(tab => tab.value === activeTab)]
    if (activeTabElement && tabsListRef.current) {
      const tabsList = tabsListRef.current
      const { offsetLeft, offsetWidth } = activeTabElement
      setTabBounds({ 
        left: isMobile ? 0 : offsetLeft - tabsList.scrollLeft, 
        width: isMobile ? tabsList.offsetWidth : offsetWidth 
      })
    }
  }, [activeTab, isMobile])

  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (tabsList) {
      let isDown = false;
      let startX: number;
      let scrollLeft: number;

      const onMouseDown = (e: MouseEvent) => {
        isDown = true;
        startX = e.pageX - tabsList.offsetLeft;
        scrollLeft = tabsList.scrollLeft;
      };

      const onMouseLeave = () => {
        isDown = false;
      };

      const onMouseUp = () => {
        isDown = false;
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tabsList.offsetLeft;
        const walk = (x - startX) * 2;
        tabsList.scrollLeft = scrollLeft - walk;
      };

      tabsList.addEventListener('mousedown', onMouseDown);
      tabsList.addEventListener('mouseleave', onMouseLeave);
      tabsList.addEventListener('mouseup', onMouseUp);
      tabsList.addEventListener('mousemove', onMouseMove);

      return () => {
        tabsList.removeEventListener('mousedown', onMouseDown);
        tabsList.removeEventListener('mouseleave', onMouseLeave);
        tabsList.removeEventListener('mouseup', onMouseUp);
        tabsList.removeEventListener('mousemove', onMouseMove);
      };
    }
  }, []);

  const handleInputChange = (section, index, field, value, subIndex = null, subField = null) => {
    setFormData(prevData => {
      const newFormData = { ...prevData };
      if (Array.isArray(newFormData[section])) {
        if (section === 'skills') {
          newFormData[section][index] = value;
        } else if (field === 'links') {
          newFormData[section][index][field][subIndex][subField] = value;
        } else {
          newFormData[section][index][field] = value;
        }
      } else {
        newFormData[section] = value;
      }
      return newFormData;
    });
  };

  const addListItem = (section) => {
    const newFormData = { ...formData }
    if (section === 'experience') {
      newFormData[section].push({ title: '', company: '', startDate: '', endDate: '', description: '', currentlyWorking: false })
    } else if (section === 'education') {
      newFormData[section].push({ degree: '', institution: '', startDate: '', endDate: '', currentlyStudying: false })
    } else if (section === 'skills') {
      newFormData[section].push('')
    } else if (section === 'projects') {
      newFormData[section].push({ name: '', description: '', links: [{ url: '', name: '' }] })
    } else if (section === 'certifications') {
      newFormData[section].push({ name: '', issuer: '', startDate: '', endDate: '', description: '' })
    }
    setFormData(newFormData)
  }

  const removeListItem = (section, index, subIndex = null) => {
    const newFormData = { ...formData }
    if (subIndex !== null) {
      newFormData[section][index].links.splice(subIndex, 1)
    } else {
      newFormData[section].splice(index, 1)
    }
    setFormData(newFormData)
  }

  const addProjectLink = (projectIndex) => {
    const newFormData = { ...formData }
    newFormData.projects[projectIndex].links.push({ url: '', name: '' })
    setFormData(newFormData)
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadComplete(false)

    // Simulate a delay for the download process
    await new Promise(resolve => setTimeout(resolve, 2000))

    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      lineHeight: 1.2
    })

    doc.setFont("times", "normal")

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 40
    let yPosition = margin

    const addSection = (title, contentFunc) => {
      doc.setFont("times", "bold")
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text(title.toUpperCase(), margin, yPosition)
      yPosition += 20

      contentFunc()
      
      yPosition += 15
    }

    doc.setFont("times", "bold")
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text(formData.fullName.toUpperCase(), pageWidth / 2, yPosition, { align: "center" })
    yPosition += 25

    doc.setFont("times", "normal")
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    const contactInfo = `${formData.email} | ${formData.phone} | ${formData.location}`
    doc.text(contactInfo, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 25

    if (formData.summary) {
      addSection("Professional Summary", () => {
        doc.setFont("times", "normal")
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        const lines = doc.splitTextToSize(formData.summary, pageWidth - 2 * margin)
        doc.text(lines, margin, yPosition)
        yPosition += lines.length * 14
      })
    }

    if (formData.experience.some(exp => exp.title || exp.company || exp.description)) {
      addSection("Experience", () => {
        formData.experience.forEach((exp) => {
          if (exp.title || exp.company || exp.description) {
            doc.setFont("times", "bold")
            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)
            doc.text(exp.title, margin, yPosition)
            yPosition += 15

            doc.setFont("times", "bold")
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            doc.text(`${exp.company} | ${formatDate(exp.startDate)} - ${exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}`, margin, yPosition)
            yPosition += 15

            doc.setFont("times", "normal")
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            const descLines = doc.splitTextToSize(exp.description, pageWidth - 2 * margin)
            doc.text(descLines, margin, yPosition)
            yPosition += descLines.length * 14 + 10
          }
        })
      })
    }

    if (formData.education.some(edu => edu.degree || edu.institution)) {
      addSection("Education", () => {
        formData.education.forEach((edu) => {
          if (edu.degree || edu.institution) {
            doc.setFont("times", "bold")
            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)
            doc.text(edu.degree, margin, yPosition)
            yPosition += 15

            doc.setFont("times", "bold")
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            doc.text(`${edu.institution} | ${formatDate(edu.startDate)} - ${edu.currentlyStudying ? 'Present' : formatDate(edu.endDate)}`, margin, yPosition)
            yPosition += 15
          }
        })
      })
    }

    if (formData.skills.some(skill => skill)) {
      addSection("Skills", () => {
        doc.setFont("times", "normal")
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        const skillsText = formData.skills.filter(Boolean).join(", ")
        const skillLines = doc.splitTextToSize(skillsText, pageWidth - 2 * margin)
        doc.text(skillLines, margin, yPosition)
        yPosition += skillLines.length * 14
      })
    }

    if (formData.projects.some(project => project.name || project.description)) {
      addSection("Projects", () => {
        formData.projects.forEach((project) => {
          if (project.name || project.description) {
            doc.setFont("times", "bold")
            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)
            doc.text(project.name, margin, yPosition)
            yPosition += 15

            doc.setFont("times", "normal")
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            const descLines = doc.splitTextToSize(project.description, pageWidth - 2 * margin)
            doc.text(descLines, margin, yPosition)
            yPosition += descLines.length * 14

            project.links.forEach((link) => {
              if (link.url) {
                doc.setTextColor(0, 0, 0)
                doc.textWithLink(link.name || 'Project Link', margin, yPosition, { url: link.url })
                yPosition += 14
              }
            })

            yPosition += 10
          }
        })
      })
    }

    if (formData.certifications.some(cert => cert.name || cert.issuer)) {
      addSection("Certifications", () => {
        formData.certifications.forEach((cert) => {
          if (cert.name || cert.issuer) {
            doc.setFont("times", "bold")
            
            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)
            doc.text(cert.name, margin, yPosition)
            yPosition += 15

            doc.setFont("times", "bold")
            
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            doc.text(`${cert.issuer} |   ${formatDate(cert.startDate)} - ${formatDate(cert.endDate)}`, margin, yPosition)
            yPosition += 15

            doc.setFont("times", "normal")
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            const descLines = doc.splitTextToSize(cert.description, pageWidth - 2 * margin)
            doc.text(descLines, margin, yPosition)
            yPosition += descLines.length * 14 + 10
          }
        })
      })
    }

    if (yPosition > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }

    const surname = formData.fullName.split(' ').pop() || 'Resume'
    const fileName = `${surname}_Resume.pdf`
    doc.save(fileName)

    setIsDownloading(false)
    setDownloadComplete(true)

    // Reset the download complete state after 3 seconds
    setTimeout(() => {
      setDownloadComplete(false)
    }, 3000)

    toast({
      title: "Resume Downloaded",
      description: `Your resume has been saved as ${fileName}`,
    })
  }

  const renderPreview = () => (
    <div className="max-w-full mx-auto font-serif text-xs sm:text-sm bg-white rounded-3xl" style={{ fontFamily: 'Times New Roman, serif' }}>
      {formData.fullName && <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-center text-black">{formData.fullName.toUpperCase()}</h2>}
      {(formData.email || formData.phone || formData.location) && (
        <div className="text-center mb-3 sm:mb-4 text-black text-xs sm:text-sm">
          <p>{[formData.email, formData.phone, formData.location].filter(Boolean).join(' | ')}</p>
        </div>
      )}
      {formData.summary && (
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-black uppercase">Professional Summary</h3>
          <p className="text-black text-xs sm:text-sm">{formData.summary}</p>
        </div>
      )}
      {formData.experience.some(exp => exp.title || exp.company || exp.description) && (
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-black uppercase">Experience</h3>
          {formData.experience.map((exp, index) => (
            exp.title || exp.company || exp.description ? (
              <div key={index} className="mb-3 sm:mb-4">
                {exp.title && <h4 className="text-xs sm:text-sm md:text-base font-medium text-black">{exp.title}</h4>}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-black text-xs sm:text-sm">
                  <p className="font-semibold">{exp.company}</p>
                  {(exp.startDate || exp.endDate) && (
                    <p>{formatDate(exp.startDate)} - {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}</p>
                  )}
                </div>
                {exp.description && <p className="mt-1 sm:mt-2 text-black text-xs sm:text-sm">{exp.description}</p>}
              </div>
            ) : null
          ))}
        </div>
      )}
      {formData.education.some(edu => edu.degree || edu.institution || edu.startDate || edu.endDate) && (
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-black uppercase">Education</h3>
          {formData.education.map((edu, index) => (
            edu.degree || edu.institution || edu.startDate || edu.endDate ? (
              <div key={index} className="mb-3 sm:mb-4">
                {edu.degree && <h4 className="text-xs sm:text-sm md:text-base font-medium text-black">{edu.degree}</h4>}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-black text-xs sm:text-sm">
                  <p className="font-semibold">{edu.institution}</p>
                  {(edu.startDate || edu.endDate) && (
                    <p>{formatDate(edu.startDate)} - {edu.currentlyStudying ? 'Present' : formatDate(edu.endDate)}</p>
                  )}
                </div>
              </div>
            ) : null
          ))}
        </div>
      )}
      {formData.skills.some(skill => skill) && (
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-black uppercase">Skills</h3>
          <p className="text-black text-xs sm:text-sm">{formData.skills.filter(Boolean).join(", ")}</p>
        </div>
      )}
      {formData.projects.some(project => project.name || project.description || project.links.some(link => link.url)) && (
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-black uppercase">Projects</h3>
          {formData.projects.map((project, index) => (
            project.name || project.description || project.links.some(link => link.url) ? (
              <div key={index} className="mb-3 sm:mb-4">
                {project.name && <h4 className="text-xs sm:text-sm md:text-base font-medium text-black">{project.name}</h4>}
                {project.description && <p className="mt-1 sm:mt-2 text-black text-xs sm:text-sm">{project.description}</p>}
                {project.links.some(link => link.url) && (
                  <ul className="mt-1 sm:mt-2 list-disc list-inside">
                    {project.links.filter(link => link.url).map((link, linkIndex) => (
                      <li key={linkIndex} className="text-xs sm:text-sm">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
                          {link.name || project.name || `Project Link ${linkIndex + 1}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null
          ))}
        </div>
      )}
      {formData.certifications.some(cert => cert.name || cert.issuer || cert.startDate || cert.endDate || cert.description) && (
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-black uppercase">Certifications</h3>
          {formData.certifications.map((cert, index) => (
            cert.name || cert.issuer || cert.startDate || cert.endDate || cert.description ? (
              <div key={index} className="mb-3 sm:mb-4">
                {cert.name && <h4 className="text-xs sm:text-sm md:text-base font-medium text-black">{cert.name}</h4>}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-black text-xs sm:text-sm">
                  <p className="font-semibold">{cert.issuer}</p>
                  {(cert.startDate || cert.endDate) && (
                    <p>{formatDate(cert.startDate)} - {formatDate(cert.endDate)}</p>
                  )}
                </div>
                {cert.description && <p className="mt-1 sm:mt-2 text-black text-xs sm:text-sm">{cert.description}</p>}
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{removeFocusBorderClass}</style>
      <main className="flex-grow py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <motion.div
  className="text-left mb-8"
  initial={{ opacity: 0, y: -50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
    My ResuMate
  </h1>
  <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
  Build your professional resume in just a few minutes!
  </p>
</motion.div>
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              <Card className="shadow-xl rounded-3xl overflow-hidden bg-white border border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList ref={tabsListRef} className="relative w-full justify-between sm:justify-start p-1 rounded-full bg-gray-100 mb-4 sm:mb-6 overflow-x-auto hide-scrollbar flex flex-nowrap gap-1">
                      <motion.div
                        className="absolute h-[85%] top-[7.5%] rounded-full bg-white shadow-sm"
                        initial={false}
                        animate={{
                          left: isMobile ? `${(100 / tabs.length) * tabs.findIndex(tab => tab.value === activeTab)}%` : tabBounds.left,
                          width: isMobile ? `${100 / tabs.length}%` : tabBounds.width
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                        style={{
                          position: 'absolute',
                          borderRadius: '9999px',
                          backgroundColor: 'white',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        }}
                      />
                      {tabs.map((tab, index) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          ref={el => tabsRef.current[index] = el}
                          className={cn(
                            "relative z-10 rounded-full px-2 py-2 sm:px-3 sm:py-1.5 text-xs font-medium transition-all duration-200 ease-in-out flex items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-initial",
                            activeTab === tab.value 
                              ? "text-primary" 
                              : "text-gray-600 hover:text-primary"
                          )}
                        >
                          <div className="w-5 h-5 sm:w-4 sm:h-4">{tab.icon}</div>
                          <span className="hidden sm:inline">{tab.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="space-y-4 sm:space-y-6 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 sm:pr-4 hide-scrollbar">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.1, ease: "easeInOut" }}
                        >
                          <TabsContent value="personal">
                            <div className="space-y-3 sm:space-y-4">
                              {['fullName', 'email', 'phone', 'location'].map((field) => (
                                <motion.div 
                                  key={field}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * ['fullName', 'email', 'phone', 'location'].indexOf(field) }}
                                >
                                  <Label htmlFor={field} className="text-sm font-medium text-gray-700 mb-1 block">
                                    {field === 'fullName' ? 'Full Name' : field.charAt(0).toUpperCase() + field.slice(1)}
                                  </Label>
                                  <Input
                                    id={field}
                                    value={formData[field]}
                                    onChange={(e) => handleInputChange(field, null, null, e.target.value)}
                                    placeholder={field === 'fullName' ? 'Your Name' : `Enter your ${field.toLowerCase().replace('_', ' ')}`}
                                    className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                  />
                                </motion.div>
                              ))}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
                              >
                                <Label htmlFor="summary" className="text-sm font-medium text-gray-700 mb-1 block">Professional Summary</Label>
                                <Textarea
                                  id="summary"
                                  value={formData.summary}
                                  onChange={(e) => handleInputChange('summary', null, null, e.target.value)}
                                  placeholder="A brief summary of your professional background and skills"
                                  className={cn("w-full h-24 sm:h-32 rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                />
                              </motion.div>
                            </div>
                          </TabsContent>
                          <TabsContent value="experience">
                            {formData.experience.map((exp, index) => (
                              <motion.div
                                key={index}
                                className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gray-50 rounded-xl relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * index }}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                                  onClick={() => removeListItem('experience', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove experience</span>
                                </Button>
                                <div className="space-y-3 sm:space-y-4">
                                  {['title', 'company'].map((field) => (
                                    <div key={field}>
                                      <Label htmlFor={`experience-${index}-${field}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                      </Label>
                                      <Input
                                        id={`experience-${index}-${field}`}
                                        value={exp[field]}
                                        onChange={(e) => handleInputChange('experience', index, field, e.target.value)}
                                        placeholder={`Enter ${field}`}
                                        className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                      />
                                    </div>
                                  ))}
                                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <div className="flex-1">
                                      <Label htmlFor={`experience-${index}-startDate`} className="text-sm font-medium text-gray-700 mb-1 block">Start Date</Label>
                                      <Input
                                        id={`experience-${index}-startDate`}
                                        type="date"
                                        value={exp.startDate}
                                        onChange={(e) => handleInputChange('experience', index, 'startDate', e.target.value)}
                                        className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <Label htmlFor={`experience-${index}-endDate`} className="text-sm font-medium text-gray-700 mb-1 block">End Date</Label>
                                      <Input
                                        id={`experience-${index}-endDate`}
                                        type="date"
                                        value={exp.endDate}
                                        onChange={(e) => handleInputChange('experience', index, 'endDate', e.target.value)}
                                        disabled={exp.currentlyWorking}
                                        className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      id={`experience-${index}-currentlyWorking`}
                                      type="checkbox"
                                      checked={exp.currentlyWorking}
                                      onChange={(e) => handleInputChange('experience', index, 'currentlyWorking', e.target.checked)}
                                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <Label htmlFor={`experience-${index}-currentlyWorking`} className="ml-2 text-sm text-gray-700">
                                      I currently work here
                                    </Label>
                                  </div>
                                  <div>
                                    <Label htmlFor={`experience-${index}-description`} className="text-sm font-medium text-gray-700 mb-1 block">Description</Label>
                                    <Textarea
                                      id={`experience-${index}-description`}
                                      value={exp.description}
                                      onChange={(e) => handleInputChange('experience', index, 'description', e.target.value)}
                                      placeholder="Describe your responsibilities and achievements"
                                      className={cn("w-full h-24 sm:h-32 rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => addListItem('experience')}
                              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-md"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Experience
                            </Button>
                          </TabsContent>
                          <TabsContent value="education">
                            {formData.education.map((edu, index) => (
                              <motion.div
                                key={index}
                                className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gray-50 rounded-xl relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * index }}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                                  onClick={() => removeListItem('education', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove education</span>
                                </Button>
                                <div className="space-y-3 sm:space-y-4">
                                  {['degree', 'institution'].map((field) => (
                                    <div key={field}>
                                      <Label htmlFor={`education-${index}-${field}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                      </Label>
                                      <Input
                                        id={`education-${index}-${field}`}
                                        value={edu[field]}
                                        onChange={(e) => handleInputChange('education', index, field, e.target.value)}
                                        placeholder={`Enter ${field}`}
                                        className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                      />
                                    </div>
                                  ))}
                                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <div className="flex-1">
                                      <Label htmlFor={`education-${index}-startDate`} className="text-sm font-medium text-gray-700 mb-1 block">Start Date</Label>
                                      <Input
                                        id={`education-${index}-startDate`}
                                        type="date"
                                        value={edu.startDate}
                                        onChange={(e) => handleInputChange('education', index, 'startDate', e.target.value)}
                                        className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <Label htmlFor={`education-${index}-endDate`} className="text-sm font-medium text-gray-700 mb-1 block">End Date</Label>
                                      <Input
                                        id={`education-${index}-endDate`}
                                        type="date"
                                        value={edu.endDate}
                                        onChange={(e) => handleInputChange('education', index, 'endDate', e.target.value)}
                                        disabled={edu.currentlyStudying}
                                        className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      id={`education-${index}-currentlyStudying`}
                                      type="checkbox"
                                      checked={edu.currentlyStudying}
                                      onChange={(e) => handleInputChange('education', index, 'currentlyStudying', e.target.checked)}
                                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <Label htmlFor={`education-${index}-currentlyStudying`} className="ml-2 text-sm text-gray-700">
                                      I am currently studying here
                                    </Label>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => addListItem('education')}
                              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-md"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Education
                            </Button>
                          </TabsContent>
                          <TabsContent value="skills">
                            {formData.skills.map((skill, index) => (
                              <motion.div
                                key={index}
                                className="mb-3 sm:mb-4 relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * index }}
                              >
                                <Input
                                  value={skill}
                                  onChange={(e) => handleInputChange('skills', index, null, e.target.value)}
                                  placeholder="Enter a skill"
                                  className={cn("w-full pr-10 rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                                  onClick={() => removeListItem('skills', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove skill</span>
                                </Button>
                              </motion.div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => addListItem('skills')}
                              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-md"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Skill
                            </Button>
                          </TabsContent>
                          <TabsContent value="projects">
                            {formData.projects.map((project, index) => (
                              <motion.div
                                key={index}
                                className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gray-50 rounded-xl relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * index }}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                                  onClick={() => removeListItem('projects', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove project</span>
                                </Button>
                                <div className="space-y-3 sm:space-y-4">
                                  <div>
                                    <Label htmlFor={`project-${index}-name`} className="text-sm font-medium text-gray-700 mb-1 block">Project Name</Label>
                                    <Input
                                      id={`project-${index}-name`}
                                      value={project.name}
                                      onChange={(e) => handleInputChange('projects', index, 'name', e.target.value)}
                                      placeholder="Enter project name"
                                      className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`project-${index}-description`} className="text-sm font-medium text-gray-700 mb-1 block">Description</Label>
                                    <Textarea
                                      id={`project-${index}-description`}
                                      value={project.description}
                                      onChange={(e) => handleInputChange('projects', index, 'description', e.target.value)}
                                      placeholder="Describe your project"
                                      className={cn("w-full h-24 sm:h-32 rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Project Links</Label>
                                    {project.links.map((link, linkIndex) => (
                                      <div key={linkIndex} className="flex items-center space-x-2 mb-2">
                                        <Input
                                          value={link.name}
                                          onChange={(e) => handleInputChange('projects', index, 'links', e.target.value, linkIndex, 'name')}
                                          placeholder="Link name"
                                          className={cn("flex-1 rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                        />
                                        <Input
                                          value={link.url}
                                          onChange={(e) => handleInputChange('projects', index, 'links', e.target.value, linkIndex, 'url')}
                                          placeholder="URL"
                                          className={cn("flex-1 rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                                          onClick={() => removeListItem('projects', index, linkIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Remove link</span>
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      onClick={() => addProjectLink(index)}
                                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-md mt-2"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Link
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => addListItem('projects')}
                              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-md"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Project
                            </Button>
                          </TabsContent>
                          <TabsContent value="certifications">
                            {formData.certifications.map((cert, index) => (
                              <motion.div
                                key={index}
                                className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gray-50 rounded-xl relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * index }}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                                  onClick={() => removeListItem('certifications', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove certification</span>
                                </Button>
                                <div className="space-y-3 sm:space-y-4">
                                  {['name', 'issuer'].map((field) => (
                                    <div key={field}>
                                      <Label htmlFor={`certification-${index}-${field}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                        {field === 'name' ? 'Certification Name' : 'Issuing Organization'}
                                      </Label>
                                      <Input
                                        id={`certification-${index}-${field}`}
                                        value={cert[field]}
                                        onChange={(e) => handleInputChange('certifications', index, field, e.target.value)}
                                        placeholder={`Enter ${field === 'name' ? 'certification name' : 'issuing organization'}`}
                                        className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                      />
                                    </div>
                                  ))}
                                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <div className="flex-1">
                                      <Label htmlFor={`certification-${index}-startDate`} className="text-sm font-medium text-gray-700 mb-1 block">Issue Date</Label>
                                      <Input
                                        id={`certification-${index}-startDate`}
                                        type="date"
                                        value={cert.startDate}
                                        onChange={(e) => handleInputChange('certifications', index, 'startDate', e.target.value)}
                                        className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <Label htmlFor={`certification-${index}-endDate`} className="text-sm font-medium text-gray-700 mb-1 block">Expiry Date (if applicable)</Label>
                                      <Input
                                        id={`certification-${index}-endDate`}
                                        type="date"
                                        value={cert.endDate}
                                        onChange={(e) => handleInputChange('certifications', index, 'endDate', e.target.value)}
                                        className={cn("w-full rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor={`certification-${index}-description`} className="text-sm font-medium text-gray-700 mb-1 block">Description</Label>
                                    <Textarea
                                      id={`certification-${index}-description`}
                                      value={cert.description}
                                      onChange={(e) => handleInputChange('certifications', index, 'description', e.target.value)}
                                      placeholder="Describe the certification and its relevance"
                                      className={cn("w-full h-24 sm:h-32 rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500", removeFocusBorder)}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => addListItem('certifications')}
                              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-md"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Certification
                            </Button>
                          </TabsContent>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <Card className="shadow-xl rounded-3xl overflow-hidden bg-white border border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-inner overflow-y-auto" style={{ height: "calc(100vh - 250px)", maxHeight: "1000px", aspectRatio: "1 / 1.414" }}>
                    {renderPreview()}
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <Button 
                      onClick={handleDownload}
                      className={cn(
                        "w-full py-2 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-300 hover:shadow-md",
                        isDownloading && "opacity-80 cursor-not-allowed",
                        downloadComplete && "bg-green-500 hover:bg-green-600"
                      )}
                      disabled={isDownloading}
                    >
                      <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downloading...
                          </>
                        ) : downloadComplete ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Downloaded
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download Resume
                          </>
                        )}
                      </motion.div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-100 py-8 mt-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <p className="text-sm text-gray-600">
        My ResuMate is a simple resume builder to help you create professional resumes quickly and easily.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Technologies</h3>
        <div className="flex flex-wrap gap-2">
          {['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'].map((tech) => (
            <div key={tech} className="relative group">
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-1">
                {tech}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
        <div className="flex space-x-4">
    <a href="https://www.facebook.com/Androxus30?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
      <Facebook className="h-6 w-6" />
      <span className="sr-only">Facebook</span>
    </a>
    <a href="https://github.com/janchrz/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
      <Github className="h-6 w-6" />
      <span className="sr-only">GitHub</span>
    </a>
    <a href="https://www.linkedin.com/in/john-christoper-dalisay-01aa76304/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
      <Linkedin className="h-6 w-6" />
      <span className="sr-only">LinkedIn</span>
    </a>
    <a href="https://www.instagram.com/jan_christoperr/?igsh=MWZzNTZvbXZ0ZjBkcw%3D%3D#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
      <Instagram className="h-6 w-6" />
      <span className="sr-only">Instagram</span>
    </a>
  </div>
</div>
    </div>
    <div className="mt-8 pt-8 border-t border-gray-200">
      <p className="text-center text-sm text-gray-500">
        © {new Date().getFullYear()} My ResuMate. All rights reserved. | 
        <a href="#" className="text-primary hover:underline ml-1">Privacy Policy</a> | 
        <a href="#" className="text-primary hover:underline ml-1">Terms of Service</a>
      </p>
      <p className="text-center text-sm text-gray-500 mt-2">
        Developed by: <a href="https://your-portfolio-url.com" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">JCD</a>
      </p>
    </div>
  </div>
</footer>
    </div>
  )
}