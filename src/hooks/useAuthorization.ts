'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export type UserLicenseInfo = {
    authorizedSeriesIds: string[];
    authorizedCourseIds: string[];
    isSuperAdmin: boolean;
};

export function useAuthorization() {
    const { data: session, status } = useSession();
    const [licenseInfo, setLicenseInfo] = useState<UserLicenseInfo>({
        authorizedSeriesIds: [],
        authorizedCourseIds: [],
        isSuperAdmin: false
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLicenses() {
            if (status !== 'authenticated' || !session?.user) {
                setIsLoading(false);
                return;
            }

            // @ts-expect-error - role extension
            const role = session.user.role;
            if (role === 'SUPER_ADMIN') {
                setLicenseInfo({
                    authorizedSeriesIds: ['ALL'],
                    authorizedCourseIds: ['ALL'],
                    isSuperAdmin: true
                });
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/user/licenses');
                if (res.ok) {
                    const data = await res.json();
                    setLicenseInfo({
                        authorizedSeriesIds: data.seriesIds || [],
                        authorizedCourseIds: data.courseIds || [],
                        isSuperAdmin: false
                    });
                }
            } catch (error) {
                console.error('Failed to fetch licenses:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLicenses();
    }, [session, status]);

    const isAuthorizedSeries = (seriesId: string) => {
        if (licenseInfo.isSuperAdmin || licenseInfo.authorizedSeriesIds.includes('ALL')) return true;
        return licenseInfo.authorizedSeriesIds.includes(seriesId);
    };

    const isAuthorizedCourse = (courseId: string) => {
        if (licenseInfo.isSuperAdmin || licenseInfo.authorizedCourseIds.includes('ALL')) return true;
        return licenseInfo.authorizedCourseIds.includes(courseId);
    };

    return {
        ...licenseInfo,
        isLoading,
        isAuthorizedSeries,
        isAuthorizedCourse
    };
}
