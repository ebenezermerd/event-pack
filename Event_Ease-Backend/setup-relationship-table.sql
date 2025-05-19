-- setup-relationship-table.sql

-- Drop the table if it exists
DROP TABLE IF EXISTS `event_relationships`;

-- Create the event_relationships table
CREATE TABLE `event_relationships` (
  `id` VARCHAR(36) NOT NULL,
  `eventId` VARCHAR(36) NOT NULL,
  `relatedEventId` VARCHAR(36) NOT NULL,
  `relationshipType` ENUM('category', 'organizer', 'series', 'custom', 'recommended') NOT NULL DEFAULT 'category',
  `strength` INT NOT NULL DEFAULT 1,
  `createdBy` VARCHAR(36),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relationship` (`eventId`, `relatedEventId`),
  CONSTRAINT `event_relationships_event_fk` FOREIGN KEY (`eventId`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `event_relationships_related_event_fk` FOREIGN KEY (`relatedEventId`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add an index for faster queries
CREATE INDEX `idx_event_relationships_eventId` ON `event_relationships` (`eventId`);
CREATE INDEX `idx_event_relationships_relatedEventId` ON `event_relationships` (`relatedEventId`);
CREATE INDEX `idx_event_relationships_type` ON `event_relationships` (`relationshipType`);

-- Insert some test relationships (if you have events in your database)
-- INSERT INTO `event_relationships` (`id`, `eventId`, `relatedEventId`, `relationshipType`, `strength`)
-- SELECT UUID(), e1.id, e2.id, 'category', 5
-- FROM `events` e1, `events` e2
-- WHERE e1.id != e2.id AND e1.category = e2.category
-- LIMIT 10; 