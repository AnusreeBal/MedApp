import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { 
  href: string;
  webOnly?: boolean;
};

export function ExternalLink({ href, webOnly = false, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href as `https://${string}`}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          event.preventDefault();
          // Use your actual seller website URL here
          const sellerWebsiteUrl = 'https://your-seller-website.com/register';
          await openBrowserAsync(sellerWebsiteUrl);
        }
      }}
    />
  );
}
