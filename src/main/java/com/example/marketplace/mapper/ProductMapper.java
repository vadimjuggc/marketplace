package com.example.marketplace.mapper;

import com.example.marketplace.dto.ProductResponse;
import com.example.marketplace.entity.Image;
import com.example.marketplace.entity.Product;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductMapper {
    public ProductResponse toResponse(Product product) {
        List<Long> imageIds = (product.getImages() != null) ? product.getImages().stream().map(Image::getId).toList() : List.of();

        Long previewId = product.getPreviewImageId() != null ? product.getPreviewImageId() : (!imageIds.isEmpty() ? imageIds.get(0) : null);

        return new ProductResponse(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getPrice(),
                product.getCity(),
                previewId,
                imageIds,
                product.isSold(),
                product.getSeller() != null ? product.getSeller().getNickName() : "Unknown",
                product.getCreatedAt()
        );
    }
}
