import { Context, Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();


app.get('/images', async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    // Fetch all images
    const images = await prisma.image.findMany({
      include: {
        place: true,     
        uploadedBy: true, 
      },
    });

    return c.json(images);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});

app.post('/images', async (c: Context) => {
  const { url, placeId, uploadedById } = await c.req.json();

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

  
    const newImage = await prisma.image.create({
      data: {
        url,
        placeId,
        uploadedById,
      },
    });

    return c.json(newImage, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});

app.get('/places/name/:placeName', async (c: Context) => {
  const placeName = c.req.param('placeName');
  
  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const place = await prisma.place.findFirst({
      where: {
        name: {
          // Use a case-insensitive 'contains' query
          contains: placeName,
          mode: 'insensitive' // This line will work with `contains` and ensure the query is case-insensitive.
        },
      },
    });
  
    if (!place) {
      return c.json({ message: 'Place not found' }, 404);
    }
  
    const images = await prisma.image.findMany({
      where: { placeId: place.id },
      include: {
        place: true,
        uploadedBy: true,  
      },
    });
  
    return c.json(images);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});


// Get a specific image by its ID
app.get('/images/:id', async (c: Context) => {
    const imageId = c.req.param('id');
  
    try {
      const prisma = new PrismaClient({
        //@ts-ignore
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
  
      const image = await prisma.image.findUnique({
        where: { id: imageId },
        include: {
          place: true,
          uploadedBy: true,
        },
      });
  
      if (!image) {
        return c.json({ error: 'Image not found' }, 404);
      }
  
      return c.json(image);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return c.json({ error: message }, 500);
    }
  });
// Delete an image by ID
app.delete('/images/:id', async (c: Context) => {
    const imageId = c.req.param('id');
  
    try {
      const prisma = new PrismaClient({
        //@ts-ignore
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
  
      // Delete the image
      await prisma.image.delete({
        where: { id: imageId },
      });
  
      return c.json({ message: 'Image deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return c.json({ error: message }, 500);
    }
  });
  
  export default app;      