package com.homecloud.backend.service;

import com.homecloud.backend.entity.File;
import com.homecloud.backend.entity.User;
import com.homecloud.backend.repository.FileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final FileStorageService fileStorageService;

    public FileService(FileRepository fileRepository,
                       FileStorageService fileStorageService) {
        this.fileRepository = fileRepository;
        this.fileStorageService = fileStorageService;
    }

    public File uploadFile(MultipartFile file, User user) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String storedFilename = fileStorageService.storeFile(file);
        Path path = fileStorageService.getFilePath(storedFilename);

        try {
            File entity = new File(
                    originalFilename,
                    storedFilename,
                    path.toString(),
                    file.getSize(),
                    file.getContentType(),
                    user
            );
            return fileRepository.save(entity);
        } catch (RuntimeException e) {
            Files.deleteIfExists(path);
            throw e;
        }
    }

    public List<File> getUserFiles(Long userId) {
        return fileRepository.findByOwner_IdOrderByCreatedAtDesc(userId);
    }

    public File getUserFile(Long fileId, Long userId) {
        return fileRepository.findByIdAndOwner_Id(fileId, userId)
                .orElseThrow(() -> new RuntimeException("File not found"));
    }

    public File renameFile(Long fileId, Long userId, String newFilename) {
        if (newFilename == null || newFilename.isBlank()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        String cleanName = java.nio.file.Paths.get(newFilename)
                .getFileName()
                .toString();

        if (cleanName.isBlank()) {
            throw new IllegalArgumentException("Invalid file name");
        }

        File file = getUserFile(fileId, userId);
        file.setFilename(cleanName);
        return fileRepository.save(file);
    }

    public void deleteFile(Long fileId, Long userId) throws IOException {
        File file = getUserFile(fileId, userId);
        fileStorageService.deleteFile(file.getStoredFilename());
        fileRepository.delete(file);
    }
}
