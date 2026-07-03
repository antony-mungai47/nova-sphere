import { prisma } from '@/lib/prisma';
import { ContentLayout, ContentSection, ContentComponent } from '@prisma/client';

export class ContentEngine {
  /**
   * Retrieves a full layout with all its nested sections and components,
   * sorted by their defined order.
   */
  static async getLayout(slug: string): Promise<ContentLayout & { sections: (ContentSection & { components: ContentComponent[] })[] } | null> {
    const layout = await prisma.contentLayout.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            components: true
          }
        }
      }
    });

    if (!layout || !layout.isPublished) return null;

    return layout;
  }
}
