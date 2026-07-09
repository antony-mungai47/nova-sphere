import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real production scenario, we'd also check user ban status here
    // e.g. const dbUser = await prisma.user.findUnique(...) 
    // if (dbUser.isBanned) throw ...

    const data = await req.formData();
    const socketId = data.get('socket_id') as string;
    const channelName = data.get('channel_name') as string;

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Auth object for presence channel
    const presenceData = {
      user_id: userId,
      user_info: {
        name: user.firstName ? `${user.firstName} ${user.lastName}` : user.username || 'Anonymous',
      }
    };

    const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData);
    
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher Auth Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
