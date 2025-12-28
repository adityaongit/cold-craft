"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  Icon,
  IconButton,
  Input,
  Textarea,
  Spinner,
  Center,
  Dialog,
  Portal,
  FileUpload,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { FileUp, Upload, Download, Star, Trash2, File, Clock } from "lucide-react";
import { ResumeWithVersion } from "@/types";
import { formatFileSize, formatRelativeTime } from "@/lib/utils";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeWithVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    notes: "",
    isDefault: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    const selectedFile = selectedFiles[0];

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("notes", formData.notes);
      formDataToSend.append("isDefault", String(formData.isDefault));
      formDataToSend.append("file", selectedFile);

      const res = await fetch("/api/resumes", {
        method: "POST",
        body: formDataToSend,
      });

      if (res.ok) {
        setShowUploadForm(false);
        setFormData({ name: "", description: "", notes: "", isDefault: false });
        setSelectedFiles([]);
        fetchResumes();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Failed to upload resume:", error);
      alert("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchResumes();
      }
    } catch (error) {
      console.error("Failed to delete resume:", error);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (res.ok) {
        fetchResumes();
      }
    } catch (error) {
      console.error("Failed to set default:", error);
    }
  }

  return (
    <AppLayout title="Resumes">
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <HStack justify="flex-end">
          <Button
            colorScheme="brand"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <Upload size={18} />
            Upload Resume
          </Button>
        </HStack>

        {/* Upload Dialog */}
        <Dialog.Root
          open={showUploadForm}
          onOpenChange={(e) => {
            setShowUploadForm(e.open);
            if (!e.open) {
              setFormData({ name: "", description: "", notes: "", isDefault: false });
              setSelectedFiles([]);
            }
          }}
          placement="center"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Upload New Resume</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <form onSubmit={handleUpload} id="upload-resume-form">
                    <VStack align="stretch" gap={4}>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Resume Name *
                        </Text>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Software Engineer Resume 2024"
                          required
                        />
                      </Box>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Description
                        </Text>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Optional description for this resume"
                          rows={2}
                        />
                      </Box>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          File *
                        </Text>
                        <FileUpload.Root
                          accept=".pdf,.doc,.docx"
                          maxFiles={1}
                          onFileChange={(details) => setSelectedFiles(details.acceptedFiles)}
                          required
                        >
                          <FileUpload.HiddenInput />
                          {selectedFiles.length === 0 ? (
                            <FileUpload.Dropzone
                              py={2}
                              px={3}
                              width="full"
                              minH="auto"
                              borderRadius="md"
                              borderWidth="1px"
                              borderStyle="dashed"
                            >
                              <HStack gap={2}>
                                <Icon fontSize="md" color={{ base: "gray.500", _dark: "gray.400" }}>
                                  <Upload size={16} />
                                </Icon>
                                <Box flex={1}>
                                  <Text fontSize="sm" display="inline">
                                    Click to upload or drag and drop
                                  </Text>
                                  <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }} display="inline" ml={1}>
                                    (PDF, DOC, DOCX)
                                  </Text>
                                </Box>
                              </HStack>
                            </FileUpload.Dropzone>
                          ) : (
                            <FileUpload.List showSize clearable />
                          )}
                        </FileUpload.Root>
                      </Box>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Version Notes
                        </Text>
                        <Input
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="e.g., Updated work experience"
                        />
                      </Box>
                    </VStack>
                  </form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline" disabled={uploading}>
                      Cancel
                    </Button>
                  </Dialog.ActionTrigger>
                  <Button
                    type="submit"
                    form="upload-resume-form"
                    colorScheme="brand"
                    loading={uploading}
                    loadingText="Uploading..."
                  >
                    Upload Resume
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        {/* Resumes List */}
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={FileUp}
            title="No resumes yet"
            description="Upload your first resume to get started. You can manage multiple versions and attach them to your outreach messages."
            actionLabel="Upload Resume"
            onAction={() => setShowUploadForm(true)}
          />
        ) : (
          <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
            {resumes.map((resume) => (
              <Card.Root
                key={resume.id}
                bg={{ base: "white", _dark: "gray.800" }}
                p={5}
                position="relative"
              >
                <VStack align="stretch" gap={3}>
                  {/* Header */}
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={1} flex={1}>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold">
                          {resume.name}
                        </Text>
                        {resume.isDefault && (
                          <Badge colorScheme="brand" variant="solid">
                            Default
                          </Badge>
                        )}
                      </HStack>
                      {resume.description && (
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                          {resume.description}
                        </Text>
                      )}
                    </VStack>

                    <HStack gap={1}>
                      {!resume.isDefault && (
                        <IconButton
                          aria-label="Set as default"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(resume.id)}
                        >
                          <Star size={16} />
                        </IconButton>
                      )}
                      <IconButton
                        aria-label="Delete resume"
                        variant="ghost"
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(resume.id)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </HStack>
                  </HStack>

                  {/* Current Version */}
                  {resume.currentVersion && (
                    <Box
                      bg={{ base: "gray.50", _dark: "gray.900" }}
                      p={3}
                      borderRadius="md"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          Current Version
                        </Text>
                        <Badge variant="outline">v{resume.currentVersion.version}</Badge>
                      </HStack>
                      <HStack gap={4} fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                        <HStack gap={1}>
                          <Icon>
                            <File size={14} />
                          </Icon>
                          <Text>{resume.currentVersion.fileName}</Text>
                        </HStack>
                        <Text>{formatFileSize(resume.currentVersion.fileSize)}</Text>
                      </HStack>
                      {resume.currentVersion.notes && (
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }} mt={2}>
                          {resume.currentVersion.notes}
                        </Text>
                      )}
                      <HStack mt={3} gap={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a href={resume.currentVersion.filePath} download>
                            <Download size={14} />
                            Download
                          </a>
                        </Button>
                      </HStack>
                    </Box>
                  )}

                  {/* Stats */}
                  <HStack
                    justify="space-between"
                    fontSize="sm"
                    color={{ base: "gray.600", _dark: "gray.400" }}
                    pt={2}
                    borderTopWidth="1px"
                    borderColor={{ base: "gray.200", _dark: "gray.700" }}
                  >
                    <HStack gap={1}>
                      <Icon>
                        <Clock size={14} />
                      </Icon>
                      <Text>Updated {formatRelativeTime(new Date(resume.updatedAt))}</Text>
                    </HStack>
                    {resume._count && (
                      <Text>
                        {resume._count.versions} version{resume._count.versions !== 1 ? "s" : ""}
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </Card.Root>
            ))}
          </Grid>
        )}
      </VStack>
    </AppLayout>
  );
}
