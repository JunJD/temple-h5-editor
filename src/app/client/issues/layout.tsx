import AnimatedTemplate from '@/components/animated-template'

export default function IssuesLayout({ children }: { children: React.ReactNode }) {
    return <AnimatedTemplate>
        <div className='py-8 px-6 md:px-8'>
            {children}
        </div>
    </AnimatedTemplate>
}
